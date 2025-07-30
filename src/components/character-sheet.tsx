"use client";

import type { Character, Attribute } from "@/lib/types";
import { ATTRIBUTES } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle, Sparkles, BrainCircuit, Droplets, HeartPulse, Hammer } from "lucide-react";

interface CharacterSheetProps {
  character: Character;
  setCharacter: (value: (prev: Character) => Character) => void;
}

export default function CharacterSheet({
  character,
  setCharacter,
}: CharacterSheetProps) {
  const handleStatChange = (stat: keyof Character, value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    if (!isNaN(numValue)) {
        setCharacter(prev => ({ ...prev, [stat]: numValue }));
    }
  };

  const handleAttributeChange = (value: string) => {
    setCharacter(prev => ({ ...prev, selectedAttribute: value as Attribute }));
  };

  const statOptions = [1, 2, 3, 4, 5];
  const essenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const willpowerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Character Stats
            </CardTitle>
            <CardDescription className="font-body">
              Set your crafter's core traits.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="grid w-full items-center gap-2.5">
                <Label htmlFor="attribute" className="font-bold text-lg font-body flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-blue-500" />
                    Primary Attribute
                </Label>
                <div className="flex gap-2">
                    <Select
                    value={character.selectedAttribute}
                    onValueChange={handleAttributeChange}
                    >
                    <SelectTrigger id="attribute" className="bg-background">
                        <SelectValue placeholder="Select Attribute" />
                    </SelectTrigger>
                    <SelectContent>
                        {ATTRIBUTES.map((attr) => (
                        <SelectItem key={attr} value={attr}>
                            {attr.charAt(0).toUpperCase() + attr.slice(1)}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Select
                    value={character[character.selectedAttribute].toString()}
                    onValueChange={(value) =>
                        handleStatChange(character.selectedAttribute, value)
                    }
                    >
                    <SelectTrigger className="w-[80px] bg-background">
                        <SelectValue />
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
            </div>
            <div className="grid w-full items-center gap-2.5">
                <Label htmlFor="craft" className="font-bold text-lg font-body flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-orange-500" />
                    Craft Skill
                </Label>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2.5">
                <Label htmlFor="essence" className="font-bold text-lg font-body flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Essence
                </Label>
                <Select
                    value={character.essence.toString()}
                    onValueChange={(value) => handleStatChange("essence", value)}
                >
                    <SelectTrigger id="essence" className="bg-background">
                    <SelectValue placeholder="Select Essence" />
                    </SelectTrigger>
                    <SelectContent>
                    {essenceOptions.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                        {val}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid w-full items-center gap-2.5">
                <Label htmlFor="willpower" className="font-bold text-lg font-body flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-500" />
                    Willpower
                </Label>
                <Select
                    value={character.willpower.toString()}
                    onValueChange={(value) => handleStatChange("willpower", value)}
                >
                    <SelectTrigger id="willpower" className="bg-background">
                    <SelectValue placeholder="Select Willpower" />
                    </SelectTrigger>
                    <SelectContent>
                    {willpowerOptions.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                        {val}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div>
            <Label className="font-bold text-lg font-body flex items-center gap-2 mb-2.5">
                <Droplets className="w-5 h-5 text-cyan-500" />
                Motes
            </Label>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="personal-motes" className="font-medium text-sm text-muted-foreground">Personal</Label>
                    <Input
                        id="personal-motes"
                        type="number"
                        value={character.personalMotes}
                        onChange={(e) => handleStatChange("personalMotes", e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="peripheral-motes" className="font-medium text-sm text-muted-foreground">Peripheral</Label>
                    <Input
                        id="peripheral-motes"
                        type="number"
                        value={character.peripheralMotes}
                        onChange={(e) => handleStatChange("peripheralMotes", e.target.value)}
                        className="bg-background"
                    />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    