"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventFormData } from "@/components/admin/AdminImportPanel";

type FormValues = {
  title: string;
  starts_at: string;
  event_kind: "social" | "nonsocial" | "";
  event_type: string;
  location: string;
  committee: string;
};

type EventFormProps = {
  value: EventFormData;
  onChange: (next: EventFormData) => void;
  showErrors?: boolean;
  disabled?: boolean;
};

const EVENT_KIND_OPTIONS = [
  { value: "social", label: "Social" },
  { value: "nonsocial", label: "Non-social" },
] as const;

const EVENT_TYPE_OPTIONS = [
  { value: "General Meeting", label: "General Meeting" },
  { value: "Workshop", label: "Workshop" },
  { value: "Panel", label: "Panel" },
  { value: "Social", label: "Social" },
  { value: "Professional Development", label: "Professional Development" },
  { value: "Competition", label: "Competition" },
] as const;

const LOCATION_OPTIONS = [
  { value: "DHC", label: "DHC" },
  { value: "MLK 225", label: "MLK 225" },
  { value: "MLK 255", label: "MLK 255" },
  { value: "Student Union", label: "Student Union" },
  { value: "Tower Lawn", label: "Tower Lawn" },
  { value: "Other", label: "Other" },
] as const;

const COMMITTEE_OPTIONS = [
  { value: "e-board", label: "E-Board" },
  { value: "workshops", label: "Workshops" },
  { value: "journalism", label: "Journalism" },
  { value: "web development", label: "Web Development" },
  { value: "finance", label: "Finance" },
  { value: "membership outreach", label: "Membership Outreach" },
  { value: "consulting", label: "Consulting" },
  { value: "growth analytics", label: "Growth Analytics" },
  { value: "marketing", label: "Marketing" },
  { value: "case", label: "Case" },
  { value: "industry", label: "Industry" },
] as const;

export function EventForm({
  value,
  onChange,
  showErrors = false,
  disabled = false,
}: EventFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      title: value.title ?? "",
      starts_at: value.startsAt ?? "",
      event_kind: value.eventKind ?? "",
      event_type: value.eventType ?? "",
      location: value.location ?? "",
      committee: value.committee ?? "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      onChange({
        title: values.title ?? "",
        startsAt: values.starts_at ?? "",
        eventKind: values.event_kind ?? "",
        eventType: values.event_type ?? "",
        location: values.location ?? "",
        committee: values.committee ?? "",
      });
    });

    return () => subscription.unsubscribe();
  }, [form, onChange]);

  useEffect(() => {
    if (showErrors) {
      void form.trigger();
    }
  }, [showErrors, form]);

  return (
    <Form {...form}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Event title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. November General Meeting"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="starts_at"
          rules={{ required: "Start date & time required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starts At</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_kind"
          rules={{ required: "Event kind is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Kind</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select event kind" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                  <SelectLabel>Event Kind</SelectLabel>
                  {EVENT_KIND_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="w-full">
                Event Type
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Optional
                </span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                                   <SelectGroup>
                  <SelectLabel>Event Type</SelectLabel>
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="w-full">
                Location
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Optional
                </span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                  <SelectLabel>Location</SelectLabel>
                  {LOCATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="committee"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="w-full">
                Committee
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Optional
                </span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select committee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                  <SelectLabel>Committee</SelectLabel>
                  {COMMITTEE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
