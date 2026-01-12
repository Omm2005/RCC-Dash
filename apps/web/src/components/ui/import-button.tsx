"use client"; 
import { Button } from "@/components/ui/button";

export const ImportButton = () => {
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
    <Button onClick={handleImport} className="pl-10 pr-10">
      Import Data
    </Button>
  );
};
