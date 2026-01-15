"use client"; // this runs in the browser bc we use useState and handle clicks + file uploads

import { useState } from "react";
import { DropdownMenuDemo } from "@/components/ui/drop-down";
import type { ImportType } from "@/components/ui/drop-down";
import UploadArea from "@/components/ui/csvupload";
import { EventForm } from "@/components/ui/event-form";
import { ImportButton } from "@/components/ui/import-button";
import { TextCard } from "@/components/ui/text-card";

// Define what "event data" must look like 
export type EventFormData = {
    title: string;
    startsAt: string;
    eventKind: "social" | "nonsocial" | "";

    // Optional metadata fields
    eventType?: string;
    location?: string;
    committee?: string;
};

// default empty event object so state starts valid
const EMPTY_EVENT: EventFormData = {
    title: "",
    startsAt: "",
    eventKind: "",
    eventType: "",
    location: "",
    committee: "",
};

/**
 * One parent needs to hold all 3 pieces of input
 * 1) Import type (dropdown)
 * 2) File (csv upload)
 * 3) eventdata (event form)
 */
export default function AdminImportPanel() {
    const [hasImported, setHasImported] = useState(false);
    const [importType, setImportType] = useState<ImportType>(null);
    const [file, setFile] = useState<File | null>(null);
    const [eventData, setEventData] = useState<EventFormData>(EMPTY_EVENT);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationSummary, setValidationSummary] = useState({
        rowsValid: 0,
        rowsWithErrors: 0,
    });
    const[successSummary, setSuccessSummary] = useState({
        rowsImported: 0,
        rowsSkipped: 0,
    });

    // Function runs when use clicks "Import Data"
    async function handleImport() {
        console.log("PARENT handleImport running. URL =", process.env.NEXT_PUBLIC_SERVER_URL);
        if (importType != "Event Attendance") {
            alert("Please select 'Event Attendance' to use this import.");
            return;
        }

        if (!file) {
            alert("Please upload a CSV file.");
            return;
        }

        if (!eventData.title || !eventData.startsAt || !eventData.eventKind) {
            alert("Please fill in required event fields (title, startsAt, eventKind).");
            return;
        }

        setIsSubmitting(true);

        try {
            const form = new FormData(); // Use formdata when sending file since JSON cannot directly contain file object
            form.append("import_type", "event_attendance"); // import type tells backend which peipleine to run
            form.append("title", eventData.title);
            form.append("starts_at", eventData.startsAt);
            form.append("event_kind", eventData.eventKind);
            form.append("event_type", eventData.eventType ?? "");

            form.append("location", eventData.location ?? "");
            form.append("committee", eventData.committee ?? "");

            form.append("file", file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/import/event-attendance`, 
                {
                    method: "POST",
                    body: form,
                }
            );
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Import failed: ${res.status}`);
            }

            const data = await res.json();

            setValidationSummary(data.validationSummary);
            setSuccessSummary(data.successSummary);
            setHasImported(true);

        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className = "flex flex-col gap-10">
            {/* Section title */}
            <div className = "flex flex-col gap-2">
                <h2 className = "font-bold text-xl">ImportData</h2>
                <p className = "text-sm text-muted-foreground">
                    Select import type, upload a CSV, and enter event details.
                </p>
            </div>

            {/* Row: dropdown + upload + import button */} 
            <div className = "flex flex-row gap-20 items-start">
                <div className = "flex flex-col gap-3">
                    <h3 className = "font-medium"> What are you importing?</h3>
                    {/* Dropdown needs to SEND selection to parent*/}
                    <DropdownMenuDemo
                        value={importType}
                        onChange={setImportType}
                    />
                </div>

                <div className = "flex flex-col gap-3">
                    <h3 className = "font-medium"> Upload CSV File</h3>
                    {/* UploadArea needs to SEND file to parent */}
                    <UploadArea onFile = {(f) => setFile(f)} />
                    <p className = "text-xs text-muted-foreground">
                        Selected: {file ? file.name : "None"}
                    </p>
                </div>

                <div className = "pt-7">
                    {/* Button triggers handleImport, which uses shared state*/}
                    <ImportButton onClick = {handleImport} disabled = {isSubmitting}/>
                </div>
            </div>

            {/* Only show event form is user selected Event Attendance */}
            {importType == "Event Attendance" && (
                <div className = "flex flex-col gap-4">
                    <h3 className = "font-bold">Event Details</h3>
                    {/* Event form needs to update parent's eventData*/}
                    <EventForm value = {eventData} onChange = {setEventData}/>
                </div>
            )}

            {/* Summary cards: later filled from backend response*/}
            {hasImported && (
                <div className = "flex flex-row gap-20">
                    <div className = "flex flex-1 flex-col gap-3">
                        <h3 className = "font-bold">Validation Summary</h3>
                        <TextCard
                            desc={`Rows Valid: ${validationSummary.rowsValid}\n\nRows with Errors: ${validationSummary.rowsWithErrors}`}
                        />
                    </div>

                    <div className = "flex flex-1 flex-col gap-3">
                        <h3 className = "font-bold">Success Summary</h3>
                        <TextCard
                            desc = {`Rows Imported: ${successSummary.rowsImported}\n\nRows Skipped: ${successSummary.rowsSkipped}`}
                        />
                    </div>
                </div>
            )}

            {!hasImported && (
                <p className="text-sm text-muted-foreground">
                Run an import to see validation and success summaries.
              </p>
            )}
        </div>
    );
}




