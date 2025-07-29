"use client";

import { allCharms } from "@/lib/charms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollText } from "lucide-react";

interface CharmSelectionProps {
  knownCharms: string[];
  activeCharms: string[];
  setActiveCharms: (charms: string[]) => void;
}

export default function CharmSelection({
  knownCharms,
  activeCharms,
  setActiveCharms,
}: CharmSelectionProps) {
  const handleCharmToggle = (charmId: string) => {
    const newActiveCharms = activeCharms.includes(charmId)
      ? activeCharms.filter((id) => id !== charmId)
      : [...activeCharms, charmId];
    setActiveCharms(newActiveCharms);
  };

  const availableCharms = allCharms.filter((charm) =>
    knownCharms.includes(charm.id)
  );

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">Crafting Charms</CardTitle>
            <CardDescription className="font-body">
              Select Charms to enhance your roll.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableCharms.length > 0 ? (
            availableCharms.map((charm) => (
              <div key={charm.id} className="flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-secondary">
                <Checkbox
                  id={charm.id}
                  checked={activeCharms.includes(charm.id)}
                  onCheckedChange={() => handleCharmToggle(charm.id)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={charm.id} className="font-bold text-base cursor-pointer font-body">
                    {charm.name}
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    {charm.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center font-body">No charms available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
