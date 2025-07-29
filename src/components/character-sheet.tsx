"use client";

import type { Character } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle } from "lucide-react";

interface CharacterSheetProps {
  character: Character;
  setCharacter: (character: Character) => void;
}

export default function CharacterSheet({ character, setCharacter }: CharacterSheetProps) {
  const handleStatChange = (stat: keyof Character, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setCharacter({ ...character, [stat]: numValue });
    }
  };

  const statOptions = [1, 2, 3, 4, 5];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">Character Stats</CardTitle>
            <CardDescription className="font-body">
              Set your crafter's core traits.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full items-center gap-2.5">
          <Label htmlFor="intelligence" className="font-bold text-lg font-body">Intelligence</Label>
          <Select
            value={character.intelligence.toString()}
            onValueChange={(value) => handleStatChange("intelligence", value)}
          >
            <SelectTrigger id="intelligence" className="bg-background">
              <SelectValue placeholder="Select Intelligence" />
            </SelectTrigger>
            <SelectContent>
              {statOptions.map((val) => (
                <SelectItem key={val} value={val.toString()}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full items-center gap-2.5">
          <Label htmlFor="craft" className="font-bold text-lg font-body">Craft Skill</Label>
          <Select
            value={character.craft.toString()}
            onValueChange={(value) => handleStatChange("craft", value)}
          >
            <SelectTrigger id="craft" className="bg-background">
              <SelectValue placeholder="Select Craft Skill" />
            </SelectTrigger>
            <SelectContent>
              {statOptions.map((val) => (
                <SelectItem key={val} value={val.toString()}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
