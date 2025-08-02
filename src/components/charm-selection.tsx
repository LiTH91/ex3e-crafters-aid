
"use client";

import React, { useState, useMemo } from "react";
import type { Charm, Character, CraftingExperience } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CharmSelectionProps {
  knownCharms: string[];
  activeCharms: string[];
  setActiveCharms: (charms: string[]) => void;
  character: Character;
  experience: CraftingExperience;
}

const CharmItem = ({ charm, activeCharms, handleCharmToggle, isDisabled }: { charm: Charm, activeCharms: string[], handleCharmToggle: (charmId: string, isSubCharm?: boolean) => void, isDisabled: boolean }) => (
    <div
        key={charm.id}
        className={`flex items-start gap-3 p-3 rounded-md transition-colors ${isDisabled ? 'opacity-50' : 'hover:bg-secondary'}`}
    >
        <Checkbox
        id={charm.id}
        checked={activeCharms.includes(charm.id)}
        onCheckedChange={() => handleCharmToggle(charm.id)}
        className="mt-1"
        disabled={isDisabled}
        />
        <div className="grid gap-1.5 leading-none">
        <Label
            htmlFor={charm.id}
            className={`font-bold text-base font-body flex items-center gap-2 ${isDisabled ? '' : 'cursor-pointer'}`}
        >
            {charm.name}
            {charm.cost && <Badge variant="secondary">{charm.cost}</Badge>}
        </Label>
        <p className="text-sm text-muted-foreground font-body">
            {charm.description}
        </p>
        </div>
    </div>
);


const CharmSelection = React.memo(({
  knownCharms,
  activeCharms,
  setActiveCharms,
  character,
  experience,
}: CharmSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const handleCharmToggle = (charmId: string) => {
    let newActiveCharms = [...activeCharms];
    const baseCharm = allCharms.find(c => c.id === charmId || c.subEffects?.some(sub => sub.id === charmId));
    const isSubEffect = baseCharm && baseCharm.id !== charmId;

    if (newActiveCharms.includes(charmId)) {
        // --- DESELECTING ---
        newActiveCharms = newActiveCharms.filter(id => id !== charmId);

        // If deselecting a base charm, deselect all its sub-charms
        if (baseCharm && !isSubEffect && baseCharm.subEffects) {
            baseCharm.subEffects.forEach(sub => {
                newActiveCharms = newActiveCharms.filter(id => id !== sub.id);
            });
        }
        
        // If deselecting a sub-charm, deselect higher-tier sub-charms of the same family
        if (isSubEffect && baseCharm && baseCharm.subEffects) {
            const subCharmIndex = baseCharm.subEffects.findIndex(s => s.id === charmId);
            if (subCharmIndex !== -1) {
                for (let i = subCharmIndex + 1; i < baseCharm.subEffects.length; i++) {
                    const higherTierId = baseCharm.subEffects[i].id;
                    newActiveCharms = newActiveCharms.filter(id => id !== higherTierId);
                }
            }
        }
        
    } else {
        // --- SELECTING ---
        newActiveCharms.push(charmId);

        // If selecting a sub-charm, also select its base charm and any lower-tier sub-charms
        if (isSubEffect && baseCharm && baseCharm.subEffects) {
            if (!newActiveCharms.includes(baseCharm.id)) {
                newActiveCharms.push(baseCharm.id);
            }
            const subCharmIndex = baseCharm.subEffects.findIndex(s => s.id === charmId);
            for (let i = 0; i < subCharmIndex; i++) {
                const lowerTierId = baseCharm.subEffects[i].id;
                if (!newActiveCharms.includes(lowerTierId)) {
                    newActiveCharms.push(lowerTierId);
                }
            }
        }
    }
    setActiveCharms(newActiveCharms);
  };


  const isCharmDisabled = (charm: Charm): boolean => {
    // An active charm can always be deselected.
    if (activeCharms.includes(charm.id)) {
        return false;
    }
      
    // Cost checks
    const costSxp = charm.cost?.match(/(\d+)sxp/);
    const costGxp = charm.cost?.match(/(\d+)gxp/);
    const costWxp = charm.cost?.match(/(\d+)wxp/);
    if (costSxp && experience.sxp < parseInt(costSxp[1], 10)) return true;
    if (costGxp && experience.gxp < parseInt(costGxp[1], 10)) return true;
    if (costWxp && experience.wxp < parseInt(costWxp[1], 10)) return true;
    
    // Special rule for Ever-Ready Innovation Discipline
    if (charm.id === 'ever-ready-innovation-discipline' && experience.sxp < 15) {
        return true;
    }

    // Prerequisites check
    if (charm.minCraft > character.craft) return true;
    if (charm.minEssence > character.essence) return true;

    return false;
  }

  const { functionalCharms, narrativeCharms } = useMemo(() => {
    const charms = allCharms
      .filter((charm) =>
        charm.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "essence") {
          if (a.minEssence !== b.minEssence) {
            return a.minEssence - b.minEssence;
          }
          if (a.minCraft !== b.minCraft) {
            return a.minCraft - b.minCraft;
          }
        }
        return a.name.localeCompare(b.name);
      });
    
    return {
        functionalCharms: charms.filter(c => c.category === 'functional'),
        narrativeCharms: charms.filter(c => c.category === 'narrative'),
    }
  }, [searchTerm, sortBy, character.craft, character.essence, experience]);
  
  const renderSubCharm = (baseCharm: Charm, subCharm: Charm) => {
      const isDisabled = isCharmDisabled(baseCharm) || isCharmDisabled(subCharm);
      return (
        <div key={subCharm.id} className="flex items-start gap-3">
          <Checkbox 
            id={subCharm.id} 
            checked={activeCharms.includes(subCharm.id)} 
            onCheckedChange={() => handleCharmToggle(subCharm.id)} 
            className="mt-1" 
            disabled={isDisabled}
          />
          <Label htmlFor={subCharm.id} className={`grid gap-1.5 leading-none ${isDisabled ? '' : 'cursor-pointer'}`}>
              <span className="font-bold text-base font-body flex items-center gap-2">{subCharm.name} {subCharm.cost && <Badge variant="secondary">{subCharm.cost}</Badge>}</span>
              <span className="text-sm text-muted-foreground font-body">{subCharm.description}</span>
          </Label>
        </div>
      )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Crafting Charms
            </CardTitle>
            <CardDescription className="font-body">
              Select Charms to enhance your roll.
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search charms..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="essence">Essence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {functionalCharms.length > 0 && (
              <div className="space-y-2">
                  <h3 className="font-headline text-lg text-primary px-3">Functional Charms</h3>
                  <Separator />
                  {functionalCharms.map((charm) => {
                    const isDisabled = isCharmDisabled(charm);
                    if (charm.subEffects) {
                        return (
                          <div key={charm.id} className={`p-3 rounded-md transition-colors ${isDisabled ? 'opacity-50' : ''}`}>
                             <div className="flex items-start gap-3">
                                <Checkbox
                                    id={charm.id}
                                    checked={activeCharms.includes(charm.id)}
                                    onCheckedChange={() => handleCharmToggle(charm.id)}
                                    className="mt-1"
                                    disabled={isDisabled}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor={charm.id} className={`font-bold text-base font-body ${isDisabled ? '' : 'cursor-pointer'}`}>
                                      {charm.name} {charm.cost && <Badge variant="secondary">{charm.cost}</Badge>}
                                    </Label>
                                    <p className="text-sm text-muted-foreground font-body">
                                        {charm.description}
                                    </p>
                                </div>
                            </div>
                            <div className="pl-8 mt-3 border-l-2 border-primary/50 space-y-3">
                               {charm.subEffects.map(subCharm => renderSubCharm(charm, subCharm))}
                            </div>
                          </div>
                        )
                    }
                    return <CharmItem key={charm.id} charm={charm} activeCharms={activeCharms} handleCharmToggle={handleCharmToggle} isDisabled={isDisabled} />
                  })}
              </div>
          )}

          {narrativeCharms.length > 0 && (
              <div className="space-y-2">
                  <h3 className="font-headline text-lg text-primary px-3 pt-4">Narrative & Passive Charms</h3>
                  <Separator />
                  {narrativeCharms.map((charm) => (
                      <CharmItem key={charm.id} charm={charm} activeCharms={activeCharms} handleCharmToggle={handleCharmToggle} isDisabled={isCharmDisabled(charm)} />
                  ))}
              </div>
          )}

          {functionalCharms.length === 0 && narrativeCharms.length === 0 && (
            <p className="text-muted-foreground text-center font-body">
              No charms found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
CharmSelection.displayName = "CharmSelection";
export default CharmSelection;
