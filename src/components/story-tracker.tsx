
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus, History } from "lucide-react";

interface StoryTrackerProps {
  charmId: string;
  charmName: string;
  currentUses: number;
  onUsesChange: (value: number) => void;
}

export default function StoryTracker({ charmId, charmName, currentUses, onUsesChange }: StoryTrackerProps) {

  const handleDecrement = () => {
    onUsesChange(Math.max(0, currentUses - 1));
  };

  const handleIncrement = () => {
    onUsesChange(currentUses + 1);
  };

  return (
    <div>
        <h3 className="font-headline text-xl text-primary mb-2 flex items-center gap-2">
            <History className="w-5 h-5" />
            Story Tracker
        </h3>
        <div className="p-4 bg-background rounded-lg shadow flex items-center justify-between">
            <div>
                <Label htmlFor={`tracker-${charmId}`} className="font-bold font-body">{charmName}</Label>
                <p className="text-sm text-muted-foreground">Manual counter for per-story charm uses.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleDecrement} disabled={currentUses === 0}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span id={`tracker-${charmId}`} className="font-bold text-xl w-8 text-center">{currentUses}</span>
                <Button variant="outline" size="icon" onClick={handleIncrement}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  );
}
