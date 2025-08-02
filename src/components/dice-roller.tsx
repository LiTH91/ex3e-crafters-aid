
"use client";

import React, { useState, useEffect } from "react";
import type { DiceRoll, CraftingOutcome, Character, ProjectType, ActiveProject, Charm, DieResult } from "@/lib/types";
import { PROJECT_TYPES } from "@/lib/types";
import { allCharms } from "@/lib/charms";
import { shouldDieExplode } from "@/lib/dice-logic";
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
  Book,
  Gem,
  Star,
  Sun,
  Flame,
  Replace,
  Moon,
  PlusCircle,
  Eye,
  Info,
  Brain,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";


interface DiceRollerProps {
  character: Character;
  activeCharms: string[];
  onRoll: (
    projectDetails: {
      type: ProjectType;
      artifactRating: number;
      objectivesMet: number;
    },
    excellencyDice: number,
    assignedProjectId?: string
  ) => void;
  isLoading: boolean;
  diceRoll: DiceRoll | null;
  aiOutcome: CraftingOutcome | null;
  activeProjects: ActiveProject[];
  willpowerSpent: number;
  setWillpowerSpent: (value: number) => void;
  isColorblindMode: boolean;
  isTriumphForgingEyeActive: boolean;
  setIsTriumphForgingEyeActive: (value: boolean) => void;
}

const getDieStyle = (die: DieResult, isColorblindMode: boolean, activeCharms: string[]): { style: string } => {
  if (die.modification === 'reroll') {
    return { style: "bg-gray-700 text-white border-gray-900 opacity-50 line-through" };
  }
   if (die.modification === 'fmd_source') {
    return { style: "bg-purple-300 text-black border-purple-500" };
  }

  // A die is a special success if its value is 10, or if it's the source/result of an explosion/conversion.
  const isExplosionSource = shouldDieExplode(die, activeCharms);
  const isSpecialSuccess = die.value === 10 || (die.value >= 7 && (isExplosionSource || die.modification === 'conversion' || die.modification === 'explosion'));


  if (isColorblindMode) {
      if (die.value === 1) return { style: "bg-rose-700 text-white border-rose-900" }; // Vermillion for 1
      if (isSpecialSuccess) return { style: "bg-orange-500 text-white border-orange-700" };
      if (die.value >= 7) return { style: "bg-sky-500 text-white border-sky-700" };
      return { style: "bg-black text-white border-gray-600" };
  }

  // Default color mode
  if (die.value === 1) return { style: "bg-red-500 text-white border-red-700" };
  if (isSpecialSuccess) return { style: "bg-yellow-400 text-black border-yellow-600" };
  if (die.value >= 7) return { style: "bg-green-500 text-white border-green-700" };
  return { style: "bg-gray-400 text-black border-gray-600" };
};

const DiceDisplay = ({ diceRoll, isColorblindMode }: { diceRoll: DiceRoll, isColorblindMode: boolean }) => (
    <TooltipProvider>
    <div className="flex flex-col items-center justify-center gap-4 p-4 bg-secondary/30 rounded-lg">
        {diceRoll.diceHistories.map((wave, waveIndex) => (
           <React.Fragment key={`wave-fragment-${waveIndex}`}>
                {waveIndex > 0 && wave.some(d => d.modificationSource === 'Divine Inspiration Technique') && (
                    <Separator className="my-2 bg-primary/20 w-1/2" />
                )}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {wave.map((die, rollIndex) => {
                       if (!die) return null;
                       const { style } = getDieStyle(die, isColorblindMode, diceRoll.activeCharmIds);
                       const valueToShow = die.modification === 'reroll' ? die.initialValue : die.value;
                       const isExplosionTrigger = shouldDieExplode(die, diceRoll.activeCharmIds);
                       
                       return (
                           <div key={`wave-${waveIndex}-roll-${rollIndex}`} className="relative">
                               <div className={`relative flex items-center justify-center w-10 h-10 border-2 rounded-md ${style}`}>
                                   <span className="text-lg font-bold">{valueToShow}</span>
                               </div>
                               {die.fmdId && (
                                   <sup className="absolute -top-1 -left-1 bg-purple-500 text-white rounded-full h-4 w-4 text-xs flex items-center justify-center">
                                       {die.fmdId}
                                   </sup>
                               )}
                                {(die.modification && die.modification !== 'fmd_source') || die.modificationSource === 'Divine Inspiration Technique' || isExplosionTrigger ? (
                                   <Tooltip>
                                       <TooltipTrigger asChild>
                                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                                                {isExplosionTrigger && <Flame className="w-3 h-3" />}
                                                {die.modification === 'explosion' && <Flame className="w-3 h-3" />}
                                                {die.modification === 'conversion' && <Replace className="w-3 h-3" />}
                                                {die.modification === 'reroll' && <div className="w-3 h-3" />}
                                                {die.modificationSource === 'Divine Inspiration Technique' && <Eye className="w-3 h-3" />}
                                            </span>
                                       </TooltipTrigger>
                                       <TooltipContent>
                                           <p>
                                               {isExplosionTrigger && `Explodes!`}
                                               {die.modification === 'explosion' && `Exploded from a ${die.initialValue}`}
                                               {die.modification === 'conversion' && `Converted to a 10 from a ${die.initialValue} (FMD #${die.fmdId})`}
                                               {die.modification === 'reroll' && `Rerolled a ${die.initialValue}`}
                                               {die.modificationSource && ` due to ${die.modificationSource}`}
                                           </p>
                                       </TooltipContent>
                                   </Tooltip>
                               ) : null}
                           </div>
                       )
                    })}
                </div>
           </React.Fragment>
        ))}
    </div>
    </TooltipProvider>
);

const calculateCharmCost = (activeCharmIds: string[], allCharms: Charm[], projectType: ProjectType, excellencyDice: number, isTriumphForgingEyeActive: boolean) => {
  let motes = isTriumphForgingEyeActive ? 0 : excellencyDice;
  let willpower = 0;
  let sxp = 0;
  let gxp = 0;
  let wxp = 0;

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
        if (projectType.startsWith('major')) {
            gxp += 4;
        } else if (projectType.startsWith('superior') || projectType.startsWith('legendary')) {
            wxp += 4;
        } else if (projectType.startsWith('basic')) {
            sxp += 4;
        }
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
  willpowerSpent,
  setWillpowerSpent,
  isColorblindMode,
  isTriumphForgingEyeActive,
  setIsTriumphForgingEyeActive,
}: DiceRollerProps) {
  const [projectType, setProjectType] = useState<ProjectType>("major-project");
  const [targetNumber, setTargetNumber] = useState(5);
  const [artifactRating, setArtifactRating] = useState(2);
  const [objectivesMet, setObjectivesMet] = useState(1);
  const [assignedProjectId, setAssignedProjectId] = useState<string | undefined>(undefined);
  const [excellencyDice, setExcellencyDice] = useState(0);

  const isBrassScalesFallingActive = activeCharms.includes('brass-scales-falling');
  const canUseTriumphForgingEye = activeCharms.includes('triumph-forging-eye');
  
  useEffect(() => {
    if (isBrassScalesFallingActive || isTriumphForgingEyeActive) {
      setExcellencyDice(0);
    }
    if (isTriumphForgingEyeActive) {
      setExcellencyDice(character[character.selectedAttribute] + character.craft);
    } else {
        // If the charm is deselected, reset excellency unless another charm is controlling it
        if (!isBrassScalesFallingActive) {
             setExcellencyDice(0);
        }
    }
  }, [isBrassScalesFallingActive, isTriumphForgingEyeActive, character.selectedAttribute, character.craft]);

  const handleRollClick = () => {
    onRoll({ 
      type: projectType,
      artifactRating: projectType.startsWith("superior-") ? artifactRating : 0,
      objectivesMet, 
    }, currentExcellencyDice, assignedProjectId);
  };

  const baseDicePool = character[character.selectedAttribute] + character.craft;
  const maxExcellencyDice = baseDicePool;
  
  const currentExcellencyDice = isTriumphForgingEyeActive ? maxExcellencyDice : (isBrassScalesFallingActive ? 0 : excellencyDice);
  
  const totalDicePool = baseDicePool + currentExcellencyDice;

  const charmCosts = calculateCharmCost(activeCharms, allCharms, projectType, currentExcellencyDice, isTriumphForgingEyeActive);
  const isWillForgingActive = activeCharms.includes("will-forging-discipline");
  const totalWillpowerCost = charmCosts.willpower + (isWillForgingActive ? willpowerSpent : 0);

  const hasCosts = Object.values(charmCosts).some(cost => cost > 0) || (isWillForgingActive && willpowerSpent > 0);


  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatProjectTypeName = (type: ProjectType) => {
    return type.split("-").map(capitalize).join(" ");
  };
  
  const activeNarrativeCharms = allCharms.filter(
    (charm) =>
      diceRoll?.activeCharmIds.includes(charm.id) && charm.category === 'narrative'
  );
  
  const successSources = [];
  if (diceRoll) {
      if (diceRoll.excellencyDice > 0) {
          successSources.push(`${diceRoll.excellencyDice} from Excellency`);
      }
      if (diceRoll.automaticSuccesses > 0) {
          successSources.push(`${diceRoll.automaticSuccesses} from Charms`);
      }
  }


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
        
        {isWillForgingActive && (
          <div>
              <Label htmlFor="willpower-spent" className="font-bold flex items-center gap-2">Will-Forging Discipline</Label>
               <Input id="willpower-spent" type="number" value={willpowerSpent} onChange={(e) => setWillpowerSpent(Math.max(0, parseInt(e.target.value, 10) || 0))} min={0} max={character.willpower} placeholder={`Spend WP (Max: ${character.willpower})`}/>
              <p className="text-sm text-muted-foreground mt-1">Spend Willpower to add 2 successes per point.</p>
          </div>
        )}

        {canUseTriumphForgingEye && (
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg">
                <Switch
                    id="triumph-forging-eye"
                    checked={isTriumphForgingEyeActive}
                    onCheckedChange={setIsTriumphForgingEyeActive}
                />
                <Label htmlFor="triumph-forging-eye" className="font-bold">Use Triumph-Forging Eye (Free Full Excellency)</Label>
            </div>
        )}

        <div>
            <Label htmlFor="excellency-dice" className="font-bold flex items-center gap-2">Craft Excellency</Label>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className="flex items-center gap-4 mt-2">
                            <Slider
                                id="excellency-dice"
                                min={0}
                                max={maxExcellencyDice}
                                step={1}
                                value={[currentExcellencyDice]}
                                onValueChange={(value) => setExcellencyDice(value[0])}
                                className="flex-1"
                                disabled={isBrassScalesFallingActive || isTriumphForgingEyeActive}
                            />
                            <Badge variant="outline" className={`flex items-center gap-2 text-base py-1 px-3 w-32 justify-center ${isBrassScalesFallingActive || isTriumphForgingEyeActive ? 'opacity-50' : ''}`}>
                                <PlusCircle className="w-4 h-4 text-green-500"/>
                                <span>{currentExcellencyDice} Dice</span>
                            </Badge>
                            <Badge variant="outline" className={`flex items-center gap-2 text-base py-1 px-3 w-32 justify-center ${isBrassScalesFallingActive || isTriumphForgingEyeActive ? 'opacity-50' : ''}`}>
                                <Gem className="w-4 h-4 text-cyan-400"/>
                                <span>{isTriumphForgingEyeActive ? 0 : currentExcellencyDice} Motes</span>
                            </Badge>
                        </div>
                    </TooltipTrigger>
                    {(isBrassScalesFallingActive || isTriumphForgingEyeActive) && (
                        <TooltipContent>
                            {isBrassScalesFallingActive && <p>Craft Excellency is disabled by Brass Scales Falling.</p>}
                            {isTriumphForgingEyeActive && <p>Craft Excellency is being provided by Triumph-Forging Eye.</p>}
                        </TooltipContent>
                    )}
                </Tooltip>
             </TooltipProvider>
            <p className="text-sm text-muted-foreground mt-1">1 Mote per die added, up to your base dice pool of {maxExcellencyDice}.</p>
        </div>


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
                         <Moon className="w-4 h-4 text-gray-400"/>
                         <span>{charmCosts.sxp} SXP</span>
                    </Badge>
                )}
                 {charmCosts.gxp > 0 && (
                     <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                         <Sun className="w-4 h-4 text-yellow-500"/>
                         <span>{charmCosts.gxp} GXP</span>
                    </Badge>
                )}
                 {charmCosts.wxp > 0 && (
                     <Badge variant="outline" className="flex items-center gap-2 text-base py-1 px-3">
                        <Star className="w-4 h-4 text-white"/>
                         <span>{charmCosts.wxp} WXP</span>
                    </Badge>
                )}
            </div>
        </div>
        )}
        <div className="text-center">
            <Button onClick={handleRollClick} disabled={isLoading} size="lg" className="font-headline text-xl">
            {isLoading ? (<Loader2 className="mr-2 h-6 w-6 animate-spin" />) : (<Dices className="mr-2 h-6 w-6" />)}
            Roll {totalDicePool} Dice
            </Button>
        </div>
        
        {diceRoll && (
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-center font-headline">
              Roll Results
            </h3>
            
            {diceRoll.diceHistories.length > 0 && (
                <DiceDisplay diceRoll={diceRoll} isColorblindMode={isColorblindMode}/>
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
             {(successSources.length > 0 || diceRoll.sxpFromCharm > 0 || diceRoll.bonusDiceFromCharm > 0) && (
                <p className="text-center text-sm text-muted-foreground">
                    {successSources.length > 0 && `(${successSources.join(', ')})`}
                    {diceRoll.sxpFromCharm > 0 && (
                         <>
                         {successSources.length > 0 ? ' | ' : ''}
                         <span className="text-yellow-500 font-bold">{`+${diceRoll.sxpFromCharm} SXP from Brass Scales Falling`}</span>
                         </>
                    )}
                    {diceRoll.bonusDiceFromCharm > 0 && (
                         <>
                         {successSources.length > 0 || diceRoll.sxpFromCharm > 0 ? ' | ' : ''}
                         <span className="text-purple-400 font-bold">{`+${diceRoll.bonusDiceFromCharm} dice from Divine Inspiration`}</span>
                         </>
                    )}
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

    

    
