
"use client";

import { useState, useMemo, memo } from "react";
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


const CharmSelection = memo(function CharmSelection({
  knownCharms,
  activeCharms,
  setActiveCharms,
  character,
  experience,
}: CharmSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const handleCharmToggle = (charmId: string, isSubCharm: boolean = false) => {
    const baseCharmId = isSubCharm ? 'supreme-masterwork-focus' : charmId;

    let newActiveCharms = [...activeCharms];

    if (newActiveCharms.includes(charmId)) {
        // If it's a sub-charm, deselecting it deselects all higher sub-charms
        if(charmId === 'supreme-masterwork-focus-1') {
            newActiveCharms = newActiveCharms.filter(id => !id.startsWith('supreme-masterwork-focus'));
        } else if (charmId === 'supreme-masterwork-focus-2') {
             newActiveCharms = newActiveCharms.filter(id => id !== 'supreme-masterwork-focus-2' && id !== 'supreme-masterwork-focus-3');
        } else {
             newActiveCharms = newActiveCharms.filter((id) => id !== charmId);
        }
    } else {
        // Add the charm
        newActiveCharms.push(charmId);
        // If it's a sub-charm, also select the base charm and lower-tier ones
        if(isSubCharm) {
            if(!newActiveCharms.includes(baseCharmId)) newActiveCharms.push(baseCharmId);
            if(charmId === 'supreme-masterwork-focus-3' && !newActiveCharms.includes('supreme-masterwork-focus-2')) {
                newActiveCharms.push('supreme-masterwork-focus-2');
            }
             if(charmId !== 'supreme-masterwork-focus-1' && !newActiveCharms.includes('supreme-masterwork-focus-1')) {
                newActiveCharms.push('supreme-masterwork-focus-1');
            }
        }
    }
    setActiveCharms(newActiveCharms);
  };

  const getSubCharm = (charm: Charm, level: 1 | 2 | 3): Charm | undefined => {
    if (charm.id !== 'supreme-masterwork-focus' || !charm.subEffects) return undefined;
    return charm.subEffects.find(c => c.id.endsWith(`-${level}`));
  }

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
  }, [searchTerm, sortBy, character.craft, character.essence]);

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
                    if (charm.id === 'supreme-masterwork-focus') {
                        const level1 = getSubCharm(charm, 1);
                        const level2 = getSubCharm(charm, 2);
                        const level3 = getSubCharm(charm, 3);
                        
                        return (
                          <div key={charm.id} className={`p-3 rounded-md transition-colors ${isCharmDisabled(charm) ? 'opacity-50' : ''}`}>
                             <p className="font-bold text-base font-body flex items-center gap-2">
                              {charm.name}
                            </p>
                            <p className="text-sm text-muted-foreground font-body mb-2">
                                {charm.description}
                            </p>
                            <div className="pl-4 border-l-2 border-primary/50 space-y-3">
                               {level1 && (
                                 <div className="flex items-start gap-3">
                                    <Checkbox id={level1.id} checked={activeCharms.includes(level1.id)} onCheckedChange={() => handleCharmToggle(level1.id, true)} className="mt-1" disabled={isCharmDisabled(charm) || isCharmDisabled(level1)} />
                                    <Label htmlFor={level1.id} className="grid gap-1.5 leading-none cursor-pointer">
                                        <span className="font-bold text-base font-body flex items-center gap-2">{level1.name} <Badge variant="secondary">{level1.cost}</Badge></span>
                                        <span className="text-sm text-muted-foreground font-body">{level1.description}</span>
                                    </Label>
                                 </div>
                               )}
                               {level2 && (
                                 <div className="flex items-start gap-3">
                                    <Checkbox id={level2.id} checked={activeCharms.includes(level2.id)} onCheckedChange={() => handleCharmToggle(level2.id, true)} className="mt-1" disabled={isCharmDisabled(charm) || isCharmDisabled(level2)} />
                                    <Label htmlFor={level2.id} className="grid gap-1.5 leading-none cursor-pointer">
                                        <span className="font-bold text-base font-body flex items-center gap-2">{level2.name} <Badge variant="secondary">{level2.cost}</Badge></span>
                                        <span className="text-sm text-muted-foreground font-body">{level2.description}</span>
                                    </Label>
                                 </div>
                               )}
                               {level3 && (
                                 <div className="flex items-start gap-3">
                                    <Checkbox id={level3.id} checked={activeCharms.includes(level3.id)} onCheckedChange={() => handleCharmToggle(level3.id, true)} className="mt-1" disabled={isCharmDisabled(charm) || isCharmDisabled(level3)} />
                                    <Label htmlFor={level3.id} className="grid gap-1.5 leading-none cursor-pointer">
                                       <span className="font-bold text-base font-body flex items-center gap-2">{level3.name} <Badge variant="secondary">{level3.cost}</Badge></span>
                                        <span className="text-sm text-muted-foreground font-body">{level3.description}</span>
                                    </Label>
                                 </div>
                               )}
                            </div>
                          </div>
                        )
                    }
                    return <CharmItem key={charm.id} charm={charm} activeCharms={activeCharms} handleCharmToggle={handleCharmToggle} isDisabled={isCharmDisabled(charm)} />
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

export default CharmSelection;
