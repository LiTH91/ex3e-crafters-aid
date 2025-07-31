

"use client";

import React, { useState, useEffect } from "react";
import type { DiceRoll, CraftingOutcome, Character, ProjectType, ActiveProject, Charm, DieResult } from "@/lib/types";
import { PROJECT_TYPES } from "@/lib/types";
import { allCharms } from "@/lib/charms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dices,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Hammer,
  ArrowRight,
  Book,
  Gem,
  Shield,
  Sun,
  Flame,
  RotateCw,
  Replace,
  Eye,
  Check,
  X,
  Star,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface DiceRollerProps {
  character: Character;
  activeCharms: string[];
  onRoll: (
    projectDetails: {
      type: ProjectType;
      artifactRating: number;
      objectivesMet: number;
      targetNumber: number;
    },
    dicePool: {
        base: number;
        excellency: number;
    },
    willpowerSpent: number,
    isTriumphForgingEyeActive: boolean,
    assignedProjectId?: string
  ) => void;
  isLoading: boolean;
  diceRoll: DiceRoll | null;
  aiOutcome: CraftingOutcome | null;
  activeProjects: ActiveProject[];
  isTriumphForgingEyeActive: boolean;
  setTriumphForgingEyeActive: (value: boolean) => void;
  isColorblindMode: boolean;
}

const isSpecialSuccess = (roll: number, activeCharms: string[]): boolean => {
  return roll === 10 ||
    (roll >= 9 && activeCharms.includes('supreme-masterwork-focus-1')) ||
    (roll >= 8 && activeCharms.includes('supreme-masterwork-focus-2')) ||
    (roll >= 7 && activeCharms.includes('supreme-masterwork-focus-3'));
};

const getDieStyle = (roll: number, activeCharms: string[]): string => {
  if (isSpecialSuccess(roll, activeCharms)) {
    return "bg-yellow-400 text-black border-yellow-600";
  }
  if (roll >= 7) {
    return "bg-green-500 text-white border-green-700";
  }
    if (roll > 1) {
    return "bg-gray-400 text-black border-gray-600";
  }
  return "bg-red-500 text-white border-red-700";
};

const DiceDisplay = ({ waves, activeCharms, isColorblindMode }: { waves: DieResult[][], activeCharms: string[], isColorblindMode: boolean }) => (
    <TooltipProvider>
    <div className="flex items-center justify-center gap-4 flex-wrap p-4 bg-secondary/30 rounded-lg">
        {waves.map((wave, waveIndex) => (
           <React.Fragment key={`wave-${waveIndex}`}>
            <div className="flex items-center gap-2 flex-wrap justify-center">
                {wave.map((die, rollIndex) => {
                    const style = isColorblindMode ? "bg-gray-400 text-black border-gray-600" : getDieStyle(die.value, activeCharms);
                    const modificationIcon = 
                        die.modification === 'explosion' ? <Flame className="w-3 h-3" /> :
                        die.modification === 'reroll' ? <RotateCw className="w-3 h-3" /> :
                        die.modification === 'conversion' ? <Replace className="w-3 h-3" /> :
                        die.modificationSource === 'Divine Inspiration Technique' || die.modificationSource === 'Holistic Miracle Understanding' ? <Eye className="w-3 h-3" /> :
                        null;

                    const tooltipText = 
                        die.modification === 'reroll' ? `Rerolled a ${die.initialValue}` :
                        die.modification === 'explosion' ? `Exploded from a ${die.initialValue}` :
                        die.modification === 'conversion' ? `Converted a ${die.initialValue} to 10` :
                        die.modificationSource === 'Divine Inspiration Technique' ? 'Bonus die from Divine Inspiration Technique' :
                        die.modificationSource === 'Holistic Miracle Understanding' ? 'Bonus die from Holistic Miracle Understanding' :
                        null;

                    return (
                        <div key={`wave-${waveIndex}-roll-${rollIndex}`} className="relative">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${style}`}>
                               <span className="text-lg font-bold">{die.value}</span>
                            </div>
                            {modificationIcon && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                                            {modificationIcon}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {tooltipText}
                                            {die.modification && die.modificationSource && !['Divine Inspiration Technique', 'Holistic Miracle Understanding'].includes(die.modificationSource) && ` due to ${die.modificationSource}`}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    )
                })}
            </div>
            {waveIndex < waves.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            )}
           </React.Fragment>
        ))}
    </div>
    </TooltipProvider>
);

const calculateCharmCost = (activeCharmIds: string[], allCharms: Charm[], projectType: ProjectType, excellencyDice: number, isTriumphForgingEyeActive: boolean) => {
  let motes = 0;
  let willpower = 0;
  let sxp = 0;
  let gxp = 0;
  let wxp = 0;

  // Excellency cost
  if (excellencyDice > 0 && !isTriumphForgingEyeActive) {
    motes += excellencyDice;
  }

  for (const id of activeCharmIds) {
    let charmToCost: Partial<Charm> | undefined;

    for (const charm of allCharms) {
      if (charm.id === id) {
        charmToCost = charm;
        break;
      }
      if (charm.subEffects) {
        const subEffect = charm.subEffects.find(se => se.id === id);
        if (subEffect) {
          charmToCost = { ...subEffect, name: `${charm.name}: ${subEffect.name}` };
          break;
        }
      }
    }

    if (!charmToCost || !charmToCost.cost || charmToCost.cost === '—') {
      continue;
    }
    
    if (charmToCost.id === 'experiential-conjuring-of-true-void') {
      if(projectType.startsWith('major')) gxp += 4;
      else if(projectType.startsWith('superior') || projectType.startsWith('legendary')) wxp += 4;
      // Basic projects not allowed, handled in disabling logic.
    }

    const costParts = charmToCost.cost.split(',').map(s => s.trim());

    for (const part of costParts) {
      if (part.endsWith('m')) {
        motes += parseInt(part, 10) || 0;
      } else if (part.endsWith('wp') && charmToCost.id !== 'will-forging-discipline') {
        willpower += parseInt(part, 10) || 0;
      } else if (part.endsWith('gxp')) {
        gxp += parseInt(part, 10) || 0;
      } else if (part.endsWith('wxp')) {
        wxp += parseInt(part, 10) || 0;
      } else if (part.endsWith('sxp')) {
        sxp += parseInt(part, 10) || 0;
      }
    }
  }

  return { motes, willpower, sxp, gxp, wxp };
};


export default function DiceRoller({
  character,
  activeCharms,
  onRoll,
  isLoading,
  diceRoll,
  aiOutcome,
  activeProjects,
  isTriumphForgingEyeActive,
  setTriumphForgingEyeActive,
  isColorblindMode,
}: DiceRollerProps) {
  const [projectType, setProjectType] = useState<ProjectType>("major-project");
  const [artifactRating, setArtifactRating] = useState(2);
  const [objectivesMet, setObjectivesMet] = useState(1);
  const [targetNumber, setTargetNumber] = useState(7);
  const [assignedProjectId, setAssignedProjectId] = useState<string | undefined>(undefined);
  const [willpowerSpent, setWillpowerSpent] = useState(0);
  const [excellencyDice, setExcellencyDice] = useState(0);

  const baseDicePool = character[character.selectedAttribute] + character.craft;
  const maxExcellency = character[character.selectedAttribute] + character.craft;

   useEffect(() => {
    if (isTriumphForgingEyeActive) {
      setExcellencyDice(maxExcellency);
    }
  }, [isTriumphForgingEyeActive, maxExcellency]);

  const handleRollClick = () => {
    onRoll({
      type: projectType,
      artifactRating: projectType.startsWith("superior-") ? artifactRating : 0,
      objectivesMet,
      targetNumber
    }, 
    { base: baseDicePool, excellency: excellencyDice },
    willpowerSpent,
    isTriumphForgingEyeActive,
    assignedProjectId);
  };

  
  const charmCosts = calculateCharmCost(activeCharms, allCharms, projectType, excellencyDice, isTriumphForgingEyeActive);
  const isWillForgingActive = activeCharms.includes("will-forging-discipline");
  const totalWillpowerCost = charmCosts.willpower + (isWillForgingActive ? willpowerSpent : 0);
  const isTriumphForgingEyeAvailable = activeCharms.includes("triumph-forging-eye");

  const hasCosts = Object.values(charmCosts).some(cost => cost > 0) || (isWillForgingActive && willpowerSpent > 0);


  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatProjectTypeName = (type: ProjectType) => {
    return type.split("-").map(capitalize).join(" ");
  };
  
  const activeNarrativeCharms = allCharms.filter(
    (charm) =>
      diceRoll?.activeCharmIds.includes(charm.id) && charm.category === 'narrative'
  );

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Hammer className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Crafting Roll
            </CardTitle>
            <CardDescription className="font-body">
              Configure and execute your crafting action.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="project-type" className="font-bold">
              Project Type
            </Label>
            <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
              <SelectTrigger id="project-type"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                   <SelectItem key={type} value={type}>{formatProjectTypeName(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {projectType.startsWith("superior-") && (
            <div>
              <Label htmlFor="artifact-rating" className="font-bold">Artifact Rating</Label>
              <Input id="artifact-rating" type="number" value={artifactRating} onChange={(e) => setArtifactRating(parseInt(e.target.value, 10))} min={2} max={5}/>
            </div>
          )}
          <div>
            <Label htmlFor="objectives-met" className="font-bold">Objectives Met (0-3)</Label>
            <Input id="objectives-met" type="number" value={objectivesMet} onChange={(e) => setObjectivesMet(parseInt(e.target.value, 10))} min={0} max={3}/>
          </div>
           <div>
            <Label htmlFor="target-number" className="font-bold">Target Number (TN)</Label>
            <Input id="target-number" type="number" value={targetNumber} onChange={(e) => setTargetNumber(parseInt(e.target.value, 10))} min={1}/>
          </div>
           <div className="md:col-span-2">
            <Label htmlFor="assign-project" className="font-bold">Assign Roll to Project (Optional)</Label>
             <Select value={assignedProjectId} onValueChange={(v) => setAssignedProjectId(v === "none" ? undefined : v)}>
              <SelectTrigger id="assign-project"><SelectValue placeholder="Select project to add progress..." /></SelectTrigger>
              <SelectContent>
                 <SelectItem value="none">Don't assign to a project</SelectItem>
                {activeProjects.map((proj) => (
                   <SelectItem key={proj.id} value={proj.id}>{proj.name} ({proj.progress}/{proj.goal})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
         <div className="space-y-4">
            <div>
                <Label htmlFor="excellency-dice" className="font-bold flex items-center gap-2">Craft Excellency</Label>
                <div className="flex items-center gap-4">
                    <Input id="excellency-dice" type="range" value={excellencyDice} onChange={(e) => setExcellencyDice(Math.max(0, parseInt(e.target.value, 10) || 0))} min={0} max={maxExcellency} disabled={isTriumphForgingEyeActive}/>
                    <span className="font-bold text-lg w-12 text-center">{excellencyDice}</span>
                </div>
                 <p className="text-sm text-muted-foreground mt-1">Add up to {maxExcellency} dice to your roll for 1 mote per die.</p>
            </div>
            {isTriumphForgingEyeAvailable && (
              <div className="flex items-center space-x-2">
                  <Switch id="triumph-forging-eye" checked={isTriumphForgingEyeActive} onCheckedChange={setTriumphForgingEyeActive} />
                  <Label htmlFor="triumph-forging-eye" className="font-bold">Use Triumph-Forging Eye (Once per week)</Label>
              </div>
            )}
            {isWillForgingActive && (
              <div>
                  <Label htmlFor="willpower-spent" className="font-bold flex items-center gap-2">Will-Forging Discipline</Label>
                   <Input id="willpower-spent" type="number" value={willpowerSpent} onChange={(e) => setWillpowerSpent(Math.max(0, parseInt(e.target.value, 10) || 0))} min={0} max={character.willpower} placeholder={`Spend WP (Max: ${character.willpower})`}/>
                  <p className="text-sm text-muted-foreground mt-1">Spend Willpower to add 2 successes per point.</p>
              </div>
            )}
             {hasCosts && (
            <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider mb-2">
                    Total Costs for this Action
                </h4>
                <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
                    {charmCosts.motes > 0 && (
                        <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                            <Gem className="w-4 h-4 text-cyan-400"/>
                            <span>{charmCosts.motes} Motes</span>
                        </Badge>
                    )}
                    {totalWillpowerCost > 0 && (
                         <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                            <Star className="w-4 h-4 text-yellow-400"/>
                            <span>{totalWillpowerCost} Willpower</span>
                        </Badge>
                    )}
                     {charmCosts.sxp > 0 && (
                         <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                             <Shield className="w-4 h-4 text-gray-400"/>
                             <span>{charmCosts.sxp} SXP</span>
                        </Badge>
                    )}
                     {charmCosts.gxp > 0 && (
                         <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                             <Sun className="w-4 h-4 text-green-400"/>
                             <span>{charmCosts.gxp} GXP</span>
                        </Badge>
                    )}
                     {charmCosts.wxp > 0 && (
                         <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                            <Star className="w-4 h-4 text-orange-400"/>
                             <span>{charmCosts.wxp} WXP</span>
                        </Badge>
                    )}
                </div>
            </div>
          )}
          <div className="text-center">
            <Button onClick={handleRollClick} disabled={isLoading} size="lg" className="font-headline text-xl">
              {isLoading ? (<Loader2 className="mr-2 h-6 w-6 animate-spin" />) : (<Dices className="mr-2 h-6 w-6" />)}
              Roll {baseDicePool + excellencyDice} Dice
            </Button>
          </div>
        </div>
        {diceRoll && (
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-center font-headline">
              Roll Results
            </h3>
            {diceRoll.diceHistories.length > 0 && (
                <DiceDisplay waves={diceRoll.diceHistories} activeCharms={diceRoll.activeCharmIds} isColorblindMode={isColorblindMode} />
            )}
             {diceRoll.bonusDiceFromDivineInspiration > 0 && (
                 <p className="text-center text-sm text-muted-foreground">
                    Gained {diceRoll.bonusDiceFromDivineInspiration} bonus dice from Divine Inspiration Technique.
                </p>
             )}
            <div className="text-center font-bold text-2xl font-headline flex items-center justify-center gap-2">
              {diceRoll.totalSuccesses >= diceRoll.targetNumber ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <span>
                {diceRoll.totalSuccesses} Successes vs TN {diceRoll.targetNumber}
              </span>
            </div>
             {diceRoll.automaticSuccesses > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    (+{diceRoll.automaticSuccesses} from Charms)
                </p>
             )}
            {diceRoll.activeCharmNames && diceRoll.activeCharmNames.length > 0 && (
              <div className="text-center text-xs text-muted-foreground font-body">
                  <p className="font-bold">Active Functional Charms:</p>
                  <p>{diceRoll.activeCharmNames.join(', ')}</p>
              </div>
            )}
            {activeNarrativeCharms.length > 0 && (
                <div className="pt-4 space-y-2">
                    <Separator />
                    <h4 className="text-center font-headline text-lg text-primary flex items-center justify-center gap-2">
                        <Book className="w-5 h-5"/>
                        Narrative Effects
                    </h4>
                    <div className="space-y-3 text-sm font-body p-3 bg-secondary/30 rounded-lg">
                        {activeNarrativeCharms.map(charm => (
                            <div key={charm.id}>
                                <p className="font-bold">{charm.name}</p>
                                <p className="text-muted-foreground">{charm.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
        {aiOutcome && (
          <Card className="mt-6 bg-background/50">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-primary">
                <Sparkles className="w-6 h-6" />
                {aiOutcome.outcomeTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-body text-base">
                <p className="italic">{aiOutcome.outcomeDescription}</p>
                <Separator />
                <div className="font-bold">
                    <h4 className="text-lg font-headline">Rewards</h4>
                    <p>SXP: {aiOutcome.experienceGained.sxp}</p>
                    <p>GXP: {aiOutcome.experienceGained.gxp}</p>
                    <p>WXP: {aiOutcome.experienceGained.wxp}</p>
                </div>

            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
