"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DropdownMenuDemo } from "@/components/ui/drop-down";
import type { ImportType } from "@/components/ui/drop-down";
import UploadArea from "@/components/ui/csvupload";
import { EventForm } from "@/components/ui/event-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export type EventFormData = {
  title: string;
  startsAt: string;
  eventKind: "social" | "nonsocial" | "";
  eventType?: string;
  location?: string;
  committee?: string;
};

const EMPTY_EVENT: EventFormData = {
  title: "",
  startsAt: "",
  eventKind: "",
  eventType: "",
  location: "",
  committee: "",
};

type ImportStep = 1 | 2 | 3 | 4;

const steps: Array<{ id: ImportStep; title: string; description: string }> = [
  {
    id: 1,
    title: "Details",
    description: "Select type and fill the form.",
  },
  {
    id: 2,
    title: "Upload",
    description: "Attach the CSV file.",
  },
  {
    id: 3,
    title: "Review",
    description: "Confirm before importing.",
  },
  {
    id: 4,
    title: "Success",
    description: "Import completed.",
  },
];

const getMissingFields = (file: File | null, data: EventFormData) => {
  const missing: string[] = [];
  if (!data.title) missing.push("event title");
  if (!data.startsAt) missing.push("event start time");
  if (!data.eventKind) missing.push("event kind");
  if (!file) missing.push("CSV file");
  return missing;
};

const EMAIL_HEADER_ALIASES = [
  "sjsu email",
  "email address",
  "email (sjsu)",
  "email",
  "sjsu email address",
];

const normalizeEmail = (email: string) =>
  (email || "").trim().toLowerCase().replace(/\s+/g, "");

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const findHeader = (headers: string[], aliases: string[]) => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: header.trim().toLowerCase(),
  }));

  for (const alias of aliases) {
    const normalizedAlias = alias.trim().toLowerCase();
    for (const header of normalizedHeaders) {
      if (normalizedAlias && header.normalized.includes(normalizedAlias)) {
        return header.original;
      }
    }
  }

  return null;
};

type DuplicateGroup = {
  email: string;
  displayEmail: string;
  rowIndices: number[];
};

export default function AdminImportPanel() {
  const [step, setStep] = useState<ImportStep>(1);
  const [hasImported, setHasImported] = useState(false);
  const [importType, setImportType] = useState<ImportType>(
    "Event Attendance"
  );
  const [file, setFile] = useState<File | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [eventData, setEventData] = useState<EventFormData>(EMPTY_EVENT);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<
    Array<Record<string, string>>
  >([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [successSummary, setSuccessSummary] = useState({
    rowsImported: 0,
    rowsSkipped: 0,
  });
  const [skippedRows, setSkippedRows] = useState<
    Array<{ row_number: number; reason: string; row: Record<string, string> }>
  >([]);
  const [emailOverrides, setEmailOverrides] = useState<
    Record<number, string>
  >({});
  const [emailDrafts, setEmailDrafts] = useState<Record<number, string>>({});

  const isSupportedType = importType === "Event Attendance";
  const missingFields = useMemo(
    () => getMissingFields(file, eventData),
    [file, eventData]
  );
  const canContinueToUpload = Boolean(
    eventData.title && eventData.startsAt && eventData.eventKind
  );
  const canContinueToReview = Boolean(file);
  const emailHeader = useMemo(
    () => findHeader(previewHeaders, EMAIL_HEADER_ALIASES),
    [previewHeaders]
  );
  const resolvedPreviewRows = useMemo(() => {
    if (!emailHeader) return previewRows;
    return previewRows.map((row, index) => {
      const override = emailOverrides[index];
      if (override === undefined) return row;
      return { ...row, [emailHeader]: override };
    });
  }, [previewRows, emailHeader, emailOverrides]);

  const duplicateGroups = useMemo<DuplicateGroup[]>(() => {
    if (!emailHeader || !resolvedPreviewRows.length) return [];
    const emailMap = new Map<
      string,
      { displayEmail: string; rowIndices: number[] }
    >();

    resolvedPreviewRows.forEach((row, index) => {
      const rawEmail = String(row[emailHeader] ?? "").trim();
      const normalized = normalizeEmail(rawEmail);
      if (!normalized) return;

      const existing = emailMap.get(normalized) ?? {
        displayEmail: rawEmail || normalized,
        rowIndices: [],
      };
      existing.rowIndices.push(index);
      if (!existing.displayEmail && rawEmail) {
        existing.displayEmail = rawEmail;
      }
      emailMap.set(normalized, existing);
    });

    return Array.from(emailMap.entries())
      .filter(([, value]) => value.rowIndices.length > 1)
      .map(([email, value]) => ({
        email,
        displayEmail: value.displayEmail || email,
        rowIndices: value.rowIndices,
      }));
  }, [resolvedPreviewRows, emailHeader]);
  const [duplicateSelections, setDuplicateSelections] = useState<
    Record<string, number>
  >({});
  const unresolvedDuplicateGroups = useMemo(
    () =>
      duplicateGroups.filter(
        (group) => duplicateSelections[group.email] === undefined
      ),
    [duplicateGroups, duplicateSelections]
  );
  const hasUnresolvedDuplicates =
    duplicateGroups.length > 0 && unresolvedDuplicateGroups.length > 0;
  const duplicateRowIndexes = useMemo(() => {
    const set = new Set<number>();
    duplicateGroups.forEach((group) => {
      group.rowIndices.forEach((index) => set.add(index));
    });
    return set;
  }, [duplicateGroups]);
  const resolvedRowIndexes = useMemo(() => {
    const set = new Set<number>();
    duplicateGroups.forEach((group) => {
      const selected = duplicateSelections[group.email];
      if (selected !== undefined) {
        set.add(selected);
      }
    });
    return set;
  }, [duplicateGroups, duplicateSelections]);

  const missingEmailRows = useMemo(() => {
    if (!emailHeader || !resolvedPreviewRows.length) return [];
    return resolvedPreviewRows
      .map((row, index) => ({
        row,
        originalIndex: index,
        value: String(row[emailHeader] ?? ""),
        isValid: isValidEmail(String(row[emailHeader] ?? "")),
      }))
      .filter((entry) => entry.value.trim().length === 0 || !entry.isValid);
  }, [resolvedPreviewRows, emailHeader]);

  const hasMissingEmails = missingEmailRows.length > 0;
  const hasEmailOverrides = Object.keys(emailOverrides).length > 0;
  const shouldFilterDuplicates =
    duplicateGroups.length > 0 && !hasUnresolvedDuplicates;
  const showResolvedRows = shouldFilterDuplicates || hasEmailOverrides;
  const canImport =
    isSupportedType &&
    missingFields.length === 0 &&
    !isSubmitting &&
    !hasUnresolvedDuplicates &&
    !hasMissingEmails &&
    Boolean(emailHeader);
  const rowsForDisplay = useMemo(() => {
    if (!shouldFilterDuplicates) {
      return resolvedPreviewRows.map((row, originalIndex) => ({
        row,
        originalIndex,
      }));
    }

    if (!emailHeader) {
      return resolvedPreviewRows.map((row, originalIndex) => ({
        row,
        originalIndex,
      }));
    }

    const duplicateIndexLookup = new Map<string, Set<number>>();
    duplicateGroups.forEach((group) => {
      duplicateIndexLookup.set(group.email, new Set(group.rowIndices));
    });

    return resolvedPreviewRows
      .map((row, originalIndex) => ({ row, originalIndex }))
      .filter(({ row, originalIndex }) => {
        const rawEmail = String(row[emailHeader] ?? "").trim();
        const normalized = normalizeEmail(rawEmail);
        const duplicateIndexes = duplicateIndexLookup.get(normalized);
        if (!duplicateIndexes) return true;
        return resolvedRowIndexes.has(originalIndex);
      });
  }, [
    resolvedPreviewRows,
    shouldFilterDuplicates,
    emailHeader,
    duplicateGroups,
    resolvedRowIndexes,
  ]);
  const resolvedRows = useMemo(() => {
    return rowsForDisplay.map((entry) => entry.row);
  }, [rowsForDisplay]);
  const importSummary = useMemo(() => {
    const totalRows = rowsForDisplay.length;
    const totalColumns = previewHeaders.length;
    if (!totalRows || !totalColumns) {
      return { totalRows, totalColumns, rowsWithEmptyCells: 0 };
    }

    let rowsWithEmptyCells = 0;
    for (const entry of rowsForDisplay) {
      const row = entry.row;
      const hasEmptyCell = previewHeaders.some((header) => {
        const value = row[header];
        if (value === undefined || value === null) return true;
        if (typeof value === "string") return value.trim() === "";
        return String(value).trim() === "";
      });
      if (hasEmptyCell) rowsWithEmptyCells += 1;
    }

    return { totalRows, totalColumns, rowsWithEmptyCells };
  }, [rowsForDisplay, previewHeaders]);

  useEffect(() => {
    setDuplicateSelections({});
    setEmailOverrides({});
    setEmailDrafts({});
  }, [file, emailHeader, previewRows.length]);

  const resetAll = () => {
    setStep(1);
    setImportType("Event Attendance");
    setFile(null);
    setFormKey((prev) => prev + 1);
    setEventData(EMPTY_EVENT);
    setPreviewHeaders([]);
    setPreviewRows([]);
    setPreviewError(null);
    setPreviewLoading(false);
    setIsSubmitting(false);
    setFormErrors([]);
    setShowFormErrors(false);
    setSuccessSummary({ rowsImported: 0, rowsSkipped: 0 });
    setSkippedRows([]);
    setDuplicateSelections({});
    setEmailOverrides({});
    setHasImported(false);
  };

  const handleTypeChange = (value: ImportType) => {
    if (!value) {
      return;
    }

    if (value === "Applications") {
      toast.info("Applications import will be here soon.");
      setFormErrors(["Applications import is coming soon."]);
      return;
    }

    setImportType(value);
    setFormErrors([]);
  };

  const handleFileSelected = (nextFile: File | null) => {
    setFile(nextFile);
    setPreviewHeaders([]);
    setPreviewRows([]);
    setPreviewError(null);
    setDuplicateSelections({});

    if (!nextFile) {
      return;
    }

    setPreviewLoading(true);
    Papa.parse(nextFile, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const rows =
          (results.data as Array<Record<string, string>>) ?? [];
        const headers =
          results.meta.fields ?? (rows[0] ? Object.keys(rows[0]) : []);
        setPreviewRows(rows);
        setPreviewHeaders(headers);
        if (results.errors?.length) {
          setPreviewError(results.errors[0]?.message ?? "Parse error.");
        }
        setPreviewLoading(false);
      },
      error: (error) => {
        setPreviewError(error.message || "Unable to parse CSV.");
        setPreviewLoading(false);
      },
    });
  };

  const handleContinueToUpload = () => {
    if (!canContinueToUpload) {
      setShowFormErrors(true);
      setFormErrors([
        "Please fill in the event title, start time, and event kind.",
      ]);
      toast.error("Complete the event form to continue.");
      return;
    }

    setFormErrors([]);
    setShowFormErrors(false);
    setStep(2);
  };

  const handleContinueToReview = () => {
    if (!file) {
      setFormErrors(["Please upload a CSV file before continuing."]);
      toast.error("Upload a CSV file to continue.");
      return;
    }

    setFormErrors([]);
    setStep(3);
  };

  const handleConfetti = () => {
    const end = Date.now() + 2000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  };

  useEffect(() => {
    if (step === 4 && hasImported && skippedRows.length === 0) {
      handleConfetti();
    }
  }, [step, hasImported, skippedRows.length]);


  const handleImport = async () => {
    if (!isSupportedType) {
      setFormErrors(["Please select Event Attendance to import."]);
      toast.error("Please select Event Attendance to import.");
      return;
    }

    if (missingFields.length) {
      const messages = missingFields.map((field) => `Missing ${field}.`);
      setFormErrors(messages);
      toast.error("Please complete all required fields.");
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!serverUrl) {
      setFormErrors(["NEXT_PUBLIC_SERVER_URL is not set."]);
      toast.error("NEXT_PUBLIC_SERVER_URL is not set.");
      return;
    }

    if (hasUnresolvedDuplicates) {
      setFormErrors([
        "Resolve duplicate emails by selecting one row per email.",
      ]);
      toast.error("Resolve duplicate emails before importing.");
      return;
    }

    if (!emailHeader) {
      setFormErrors([
        "CSV must include an email column (Email / SJSU Email / Email Address).",
      ]);
      toast.error("Add an email column before importing.");
      return;
    }

    if (hasMissingEmails) {
      setFormErrors(["Resolve missing emails before importing."]);
      toast.error("Resolve missing emails before importing.");
      return;
    }

    setIsSubmitting(true);
    setFormErrors([]);

    try {
      const form = new FormData();
      form.append("import_type", "event_attendance");
      form.append("title", eventData.title);
      form.append("starts_at", eventData.startsAt);
      form.append("event_kind", eventData.eventKind);
      form.append("event_type", eventData.eventType ?? "");
      form.append("location", eventData.location ?? "");
      form.append("committee", eventData.committee ?? "");
      let fileToUpload: File = file as File;
      if (emailHeader && (duplicateGroups.length || hasEmailOverrides)) {
        const csv = Papa.unparse(resolvedRows, { columns: previewHeaders });
        const resolvedName = file!.name.replace(/\.csv$/i, "") + "-resolved.csv";
        fileToUpload = new File([csv], resolvedName, { type: "text/csv" });
      }
      form.append("file", fileToUpload);

      const importPromise = (async () => {
        const res = await fetch(`${serverUrl}/api/import/event-attendance`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Import failed: ${res.status}`);
        }

        return res.json();
      })();

      toast.promise(importPromise, {
        loading: "Importing data...",
        success: "Import completed successfully.",
        error: (error) =>
          error instanceof Error ? error.message : "Import failed.",
      });

      const data = await importPromise;
      setSuccessSummary(data.successSummary);
      setSkippedRows(data.skippedRows ?? []);
      setHasImported(true);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyEmailOverrides = () => {
    if (!missingEmailRows.length) return;

    const pending = missingEmailRows.map((entry) => {
      const draft = emailDrafts[entry.originalIndex];
      const value = draft ?? entry.value;
      return {
        index: entry.originalIndex,
        value,
        isValid: isValidEmail(value),
      };
    });

    const invalid = pending.filter((entry) => !entry.isValid);
    if (invalid.length) {
      toast.error("Please enter valid emails before applying.");
      return;
    }

    setEmailOverrides((prev) => {
      const next = { ...prev };
      pending.forEach((entry) => {
        next[entry.index] = entry.value.trim();
      });
      return next;
    });
    setEmailDrafts((prev) => {
      const next = { ...prev };
      pending.forEach((entry) => {
        delete next[entry.index];
      });
      return next;
    });
    toast.success("Email updates applied.");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Import data</h2>
        <p className="text-sm text-muted-foreground">
          Follow the steps to import a dataset.
        </p>
      </div>

      <div className="sm:hidden">
        <div className="flex items-center">
          {steps.map((item, index) => {
            const isComplete = step > item.id;
            const isCurrent = step === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center",
                  index < steps.length - 1 ? "flex-1" : "flex-none"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                    isCurrent &&
                      "border-foreground bg-foreground text-background",
                    isComplete &&
                      !isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    !isComplete &&
                      !isCurrent &&
                      "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {item.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 rounded-full",
                      isComplete ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden gap-6 sm:grid sm:grid-cols-4">
        {steps.map((item) => {
          const isComplete = step > item.id;
          const isCurrent = step === item.id;
          return (
            <div key={item.id} className="flex flex-col gap-3">
              <div
                className={cn(
                  "h-1 w-full rounded-full",
                  (isComplete || isCurrent) && "bg-primary",
                  !isComplete && !isCurrent && "bg-muted"
                )}
              />
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    !isComplete && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Event details</CardTitle>
            <CardDescription>
              Event Attendance is the only available import right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Import type
              </p>
              <DropdownMenuDemo value={importType} onChange={handleTypeChange} />
            </div>

            {isSupportedType && (
              <div className="space-y-3">
                <EventForm
                  key={formKey}
                  value={eventData}
                  onChange={setEventData}
                  showErrors={showFormErrors}
                />
              </div>
            )}

          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleContinueToUpload} disabled={isSubmitting}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload CSV</CardTitle>
            <CardDescription>
              Add the CSV file that contains the attendance data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <UploadArea onFile={handleFileSelected} />
            <p className="text-xs text-muted-foreground">
              Selected: {file ? file.name : "None"}
            </p>
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              onClick={handleContinueToReview}
              disabled={!canContinueToReview || isSubmitting}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review</CardTitle>
            <CardDescription>
              Review the details and CSV rows before importing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Import type
                </p>
                <p className="text-sm font-medium">
                  {importType ?? "Not selected"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  File
                </p>
                <p className="text-sm font-medium">
                  {file ? file.name : "No file selected"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Event summary
                </p>
                <p className="text-sm font-medium">
                  {eventData.title || "No title"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {eventData.startsAt || "No start time"} ·{" "}
                  {eventData.eventKind || "No event kind"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Import summary
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card size="sm" className="border-muted/60 bg-muted/10">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Rows detected</p>
                      <p className="text-lg font-semibold">
                        {importSummary.totalRows}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card size="sm" className="border-muted/60 bg-muted/10">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Columns</p>
                      <p className="text-lg font-semibold">
                        {importSummary.totalColumns}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card size="sm" className="border-muted/60 bg-muted/10">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Rows with empty cells
                      </p>
                      <p className="text-lg font-semibold">
                        {importSummary.rowsWithEmptyCells}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {previewError && (
                <p className="text-xs text-rose-600">{previewError}</p>
              )}
            </div>

            {!emailHeader && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-700">
                CSV must include an email column (Email / SJSU Email / Email
                Address) to import.
              </div>
            )}

            {emailHeader && missingEmailRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      Resolve missing or invalid emails
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enter a valid email address to keep these rows.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-amber-600">
                      {missingEmailRows.length} missing
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyEmailOverrides}
                    >
                      Apply emails
                    </Button>
                  </div>
                </div>
                <div className="max-h-56 overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-xs">Row</TableHead>
                        <TableHead className="text-xs">
                          {emailHeader}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingEmailRows.map((entry) => {
                        const draftValue =
                          emailDrafts[entry.originalIndex] ?? entry.value;
                        const isValid = isValidEmail(draftValue);
                        return (
                        <TableRow key={entry.originalIndex}>
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.originalIndex + 1}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Input
                              value={draftValue}
                              placeholder="name@sjsu.edu"
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setEmailDrafts((prev) => ({
                                  ...prev,
                                  [entry.originalIndex]: nextValue,
                                }));
                              }}
                              className={cn(
                                "h-8 text-xs",
                                !isValid &&
                                  "border-destructive/60 focus-visible:border-destructive"
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {duplicateGroups.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      Resolve duplicate emails
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select one row to keep for each email before importing.
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      hasUnresolvedDuplicates
                        ? "text-amber-600"
                        : "text-emerald-600"
                    )}
                  >
                    {hasUnresolvedDuplicates
                      ? `${unresolvedDuplicateGroups.length} unresolved`
                      : "All resolved"}
                  </p>
                </div>
                <div className="space-y-4">
                  {duplicateGroups.map((group) => (
                    <div key={group.email} className="rounded-lg border">
                      <div className="flex items-center justify-between border-b px-3 py-2">
                        <p className="text-xs font-semibold">
                          {group.displayEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.rowIndices.length} rows
                        </p>
                      </div>
                      <div className="max-h-64 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10 text-xs">Row</TableHead>
                              <TableHead className="w-24 text-xs">
                                Keep
                              </TableHead>
                              {previewHeaders.map((header) => (
                                <TableHead key={header} className="text-xs">
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.rowIndices.map((rowIndex) => {
                              const row = resolvedPreviewRows[rowIndex];
                              const isSelected =
                                duplicateSelections[group.email] === rowIndex;
                              return (
                                <TableRow
                                  key={`${group.email}-${rowIndex}`}
                                  className={cn(
                                    isSelected && "bg-emerald-500/10"
                                  )}
                                >
                                  <TableCell className="text-xs text-muted-foreground">
                                    {rowIndex + 1}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    <Button
                                      size="xs"
                                      variant={isSelected ? "default" : "outline"}
                                      onClick={() => {
                                        setDuplicateSelections((prev) => {
                                          const next = { ...prev };
                                          if (next[group.email] === rowIndex) {
                                            delete next[group.email];
                                            return next;
                                          }
                                          next[group.email] = rowIndex;
                                          return next;
                                        });
                                      }}
                                    >
                                      {isSelected ? "Selected" : "Keep"}
                                    </Button>
                                  </TableCell>
                                  {previewHeaders.map((header) => (
                                    <TableCell
                                      key={`${header}-${rowIndex}`}
                                      className="text-xs"
                                    >
                                      {row?.[header] ?? ""}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
                {hasUnresolvedDuplicates && (
                  <p className="text-xs text-amber-600">
                    Select one row for each duplicate email to continue.
                  </p>
                )}
              </div>
            )}

            <div className="overflow-hidden rounded-lg border">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  CSV rows ({rowsForDisplay.length || 0})
                </p>
                {showResolvedRows && (
                  <span className="text-xs text-emerald-600">
                    Resolved view
                  </span>
                )}
                {previewLoading && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Parsing
                  </span>
                )}
              </div>
              {rowsForDisplay.length ? (
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-xs">#</TableHead>
                        {previewHeaders.map((header) => (
                          <TableHead key={header} className="text-xs">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rowsForDisplay.map((entry) => (
                        <TableRow
                          key={entry.originalIndex}
                          className={cn(
                            resolvedRowIndexes.has(entry.originalIndex) &&
                              "bg-emerald-500/10",
                            duplicateRowIndexes.has(entry.originalIndex) &&
                              !resolvedRowIndexes.has(entry.originalIndex) &&
                              "bg-amber-500/5"
                          )}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.originalIndex + 1}
                          </TableCell>
                          {previewHeaders.map((header) => (
                            <TableCell
                              key={`${header}-${entry.originalIndex}`}
                              className="text-xs"
                            >
                              {entry.row[header] ?? ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="px-4 py-3 text-xs text-muted-foreground">
                  Upload a CSV to see the rows here.
                </p>
              )}
            </div>

          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button onClick={handleImport} disabled={!canImport}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </span>
              ) : (
                "Import data"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Import complete</CardTitle>
            <CardDescription>
              Your data has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasImported ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Success summary</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card size="sm" className="border-muted/60 bg-muted/10">
                      <CardContent className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Rows imported
                          </p>
                          <p className="text-lg font-semibold">
                            {successSummary.rowsImported}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card size="sm" className="border-muted/60 bg-muted/10">
                      <CardContent className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Rows skipped
                          </p>
                          <p className="text-lg font-semibold">
                            {successSummary.rowsSkipped}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Skipped rows</h3>
                  {skippedRows.length ? (
                    <div className="max-h-64 overflow-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Row</TableHead>
                            <TableHead className="text-xs">Reason</TableHead>
                            {Object.keys(skippedRows[0].row).map((key) => (
                              <TableHead key={key} className="text-xs">
                                {key}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {skippedRows.map((item, index) => (
                            <TableRow key={index} className="bg-amber-500/10">
                              <TableCell className="text-xs">
                                {item.row_number}
                              </TableCell>
                              <TableCell className="text-xs">
                                {item.reason}
                              </TableCell>
                              {Object.keys(skippedRows[0].row).map((key) => (
                                <TableCell key={key} className="text-xs">
                                  {item.row[key] ?? ""}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skipped rows reported.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No import data available.
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={resetAll}>
              Start over
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
