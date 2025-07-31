
"use client";

import React from "react";
import type { Character, Attribute } from "@/lib/types";
import { ATTRIBUTES } from "@/lib/constants";
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
import { User, Hammer } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CharacterSheetProps {
  character: Character;
  onCharacterChange: (field: keyof Character, value: number) => void;
  onAttributeChange: (attribute: Attribute) => void;
}

const statOptions = [0, 1, 2, 3, 4, 5];

const CharacterAttribute = React.memo(({
    attr,
    value,
    onValueChange,
}: {
    attr: string;
    value: number;
    onValueChange: (value: string) => void;
}) => (
    <div className="grid w-full items-center gap-2.5">
        <Label htmlFor={attr} className="font-bold font-body">
            {attr.charAt(0).toUpperCase() + attr.slice(1)}
        </Label>
        <Select value={value.toString()} onValueChange={onValueChange}>
            <SelectTrigger id={attr} className="bg-background">
                <SelectValue placeholder="Select value" />
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
));


const CharacterSheet = ({
  character,
  onCharacterChange,
  onAttributeChange
}: CharacterSheetProps) => {

  const handleStatChange = (stat: keyof Character, value: string) => {
    onCharacterChange(stat, parseInt(value, 10));
  };
  
  const handleAttributeChange = (value: string) => {
      onAttributeChange(value as Attribute);
  }

  // Defensive check: Ensure selectedAttribute is valid before rendering.
  const selectedAttributeValue = character.selectedAttribute && character[character.selectedAttribute] !== undefined
    ? character[character.selectedAttribute]
    : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          <div>
            <CardTitle className="font-headline text-2xl text-primary">
              Character Sheet
            </CardTitle>
            <CardDescription className="font-body">
              Define your crafter's abilities and essence.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <h3 className="font-headline text-xl text-primary mb-2">Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ATTRIBUTES.map((attr) => (
                    <CharacterAttribute 
                        key={attr}
                        attr={attr}
                        value={character[attr as Attribute] || 0}
                        onValueChange={(value) => handleStatChange(attr as Attribute, value)}
                    />
                ))}
            </div>
        </div>
        <Separator />
         <div className="space-y-4">
            <h3 className="font-headline text-xl text-primary mb-2">Craft</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 <div className="grid w-full items-center gap-2.5">
                    <Label htmlFor="attribute" className="font-bold text-lg font-body flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500"/>
                        Base Attribute
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
                         value={selectedAttributeValue.toString()}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterSheet;
