
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

const CharmItem = ({ charm, activeCharms, handleCharmToggle, isDisabled }: { charm: Charm, activeCharms: string[], handleCharmToggle: (charmId: string, isSubCharm?: boolean, baseCharmId?: string) => void, isDisabled: boolean }) => (
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
    const isCurrentlyActive = newActiveCharms.includes(charmId);

    if (isCurrentlyActive) {
        // Deselecting a charm
        newActiveCharms = newActiveCharms.filter(id => id !== charmId);

        // If it's a base charm, also deselect its sub-effects
        const baseCharm = allCharms.find(c => c.id === charmId);
        if (baseCharm?.subEffects) {
            const subEffectIds = baseCharm.subEffects.map(se => se.id);
            newActiveCharms = newActiveCharms.filter(id => !subEffectIds.includes(id));
        }

    } else {
        // Selecting a charm
        newActiveCharms.push(charmId);
        
        // If selecting a sub-effect, ensure the base charm is active
        const parentCharm = allCharms.find(c => c.subEffects?.some(se => se.id === charmId));
        if (parentCharm && !newActiveCharms.includes(parentCharm.id)) {
            newActiveCharms.push(parentCharm.id);
        }
    }
    setActiveCharms(newActiveCharms);
  };


  const isCharmDisabled = (charm: Charm): boolean => {
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

    // A sub-effect cannot be active if its base charm is not active
    const parentCharm = allCharms.find(c => c.subEffects?.some(se => se.id === charm.id));
    if (parentCharm && !activeCharms.includes(parentCharm.id)) {
        // This is commented out to allow selection of sub-effect to auto-select base
        // return true; 
    }


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
  }, [searchTerm, sortBy]);

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
                    if (charm.subEffects && charm.subEffects.length > 0) {
                        return (
                           <div key={charm.id} className="p-3">
                            <CharmItem charm={charm} activeCharms={activeCharms} handleCharmToggle={handleCharmToggle} isDisabled={isDisabled} />
                            <div className="pl-8 pt-3 border-l-2 border-primary/50 ml-2 space-y-3">
                               {charm.subEffects.map(subCharm => {
                                 const isSubDisabled = isCharmDisabled(subCharm) || isDisabled || !activeCharms.includes(charm.id);
                                 return (
                                     <CharmItem key={subCharm.id} charm={subCharm} activeCharms={activeCharms} handleCharmToggle={handleCharmToggle} isDisabled={isSubDisabled} />
                                 );
                               })}
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
