"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react"; // optional icon
import { useState } from "react";

type FormValues = {
  title: string;
  starts_at: string;
  event_kind: string;
  event_type: string;
  location: string;
  committee: string;
};

export const EventForm = () => {
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      starts_at: "",
      event_kind: "",
      event_type: "",
      location: "",
      committee: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);

  };

  const handleImport = async () => {
    try {
    const response = await fetch("api/import-data/event-attendance", {
      method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        //send file over
        body: JSON.stringify({ }), 
    })

    if (!response.ok){
      throw new Error("Import failed")
    }
  } catch (error) {
    console.error("Error: " + error);
  }
  };

  return (
    <div className="flex justify-center items-start mt-12">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <Form {...form}>
          <h2 className="text-2xl font-semibold mb-6 text-center">Event Form</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Event Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Starts_at */}
            <FormField
              control={form.control}
              name="starts_at"
              rules={{ required: "Start date & time required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starts At</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Kind */}
            <FormField
              control={form.control}
              name="event_kind"
              rules={{ required: "Event kind is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Kind</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Event Kind" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Meeting">General Meeting</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Panel">Panel</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Professional Development">Professional Development</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type */}
            <FormField
              control={form.control}
              name="event_type"
              rules={{ required: "Event type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Event Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Non-social">Non-social</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DHC">DHC</SelectItem>
                        <SelectItem value="MLK 225">MLK 225</SelectItem>
                        <SelectItem value="MLK 255">MLK 255</SelectItem>
                        <SelectItem value="Student Union">Student Union</SelectItem>
                        <SelectItem value="Tower Lawn">Tower Lawn</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Committee */}
            <FormField
              control={form.control}
              name="committee"
              rules={{ required: "Committee is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Committee</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Committee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="e-board">E-Board</SelectItem>
                        <SelectItem value="workshops">Workshops</SelectItem>
                        <SelectItem value="journalism">Journalism</SelectItem>
                        <SelectItem value="web development">Web Development</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="membership outreach">Membership Outreach</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="growth analytics">Growth Analytics</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="case">Case</SelectItem>
                        <SelectItem value="industry">Industry</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full mt-2" onClick={handleImport}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
