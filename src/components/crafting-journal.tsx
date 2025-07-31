"use client";

import React from "react";
import { JournalEntry } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface CraftingJournalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

const CraftingJournal: React.FC<CraftingJournalProps> = ({ isOpen, onClose, entries }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-1/2 lg:w-1/3">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen />
            Crafting Journal
          </SheetTitle>
          <SheetDescription>
            A log of your completed crafting projects.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] my-4 pr-4">
          <div className="space-y-4">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle>{entry.projectName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()} - <span className="capitalize">{entry.category}</span>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{entry.notes || "No notes for this project."}</p>
                  </CardContent>
                   <CardFooter>
                     <p className="text-xs text-muted-foreground">Successes: {entry.outcome.successes}</p>
                   </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <p>You have no completed projects in your journal.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CraftingJournal;
