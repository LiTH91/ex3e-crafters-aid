
"use client";

import { useState } from "react";
import type { DiceRoll, CraftingOutcome, Character, ProjectType, ActiveProject, Charm } from "@/lib/types";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DiceRollerProps {
  character: Character;
  activeCharms: string[];
  targetNumber: number;
  setTargetNumber: (value: number) => void;
  onRoll: (
    projectDetails: {
      type: ProjectType;
      artifactRating: number;
      objectivesMet: number;
    },
    assignedProjectId?: string
  ) => void;
  isLoading: boolean;
  diceRoll: DiceRoll | null;
  aiOutcome: CraftingOutcome | null;
  activeProjects: ActiveProject[];
  willpowerSpent: number;
  setWillpowerSpent: (value: number) => void;
}

const getDieStyle = (roll: number, activeCharms: string[]): string => {
  const isSpecialSuccess =
    roll === 10 ||
    (roll >= 9 && activeCharms.includes('supreme-masterwork-focus-1')) ||
    (roll >= 8 && activeCharms.includes('supreme-masterwork-focus-2')) ||
    (roll >= 7 && activeCharms.includes('supreme-masterwork-focus-3'));

  if (isSpecialSuccess) {
    return "bg-yellow-400 text-black border-yellow-600";
  }
  if (roll >= 7) {
    return "bg-green-500 text-white border-green-700";
  }
  if (roll === 1) {
    return "bg-red-500 text-white border-red-700";
  }
  // Neutral style for rolls 2-6
  return "bg-gray-400 text-black border-gray-600";
};


const DiceDisplay = ({ waves, activeCharms }: { waves: number[][], activeCharms: string[] }) => (
    <div className="flex items-center justify-center gap-4 flex-wrap p-4 bg-secondary/30 rounded-lg">
        {waves.map((wave, waveIndex) => (
           <div key={`wave-${waveIndex}`} className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {wave.map((roll, rollIndex) => {
                       const style = getDieStyle(roll, activeCharms);
                       return (
                           <div key={`wave-${waveIndex}-roll-${rollIndex}`} className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${style}`}>
                               <span className="absolute text-lg font-bold">{roll}</span>
                           </div>
                       )
                    })}
                </div>
                {waveIndex < waves.length - 1 && (
                     <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                )}
           </div>
        ))}
    </div>
);


export default function DiceRoller({
  character,
  activeCharms,
  targetNumber,
  setTargetNumber,
  onRoll,
  isLoading,
  diceRoll,
  aiOutcome,
  activeProjects,
  willpowerSpent,
  setWillpowerSpent,
}: DiceRollerProps) {
  const [projectType, setProjectType] = useState<ProjectType>("basic-project");
  const [artifactRating, setArtifactRating] = useState(2);
  const [objectivesMet, setObjectivesMet] = useState(1);
  const [assignedProjectId, setAssignedProjectId] = useState<string | undefined>(undefined);


  const handleRollClick = () => {
    onRoll({
      type: projectType,
      artifactRating: projectType.startsWith("superior-") ? artifactRating : 0,
      objectivesMet,
    }, assignedProjectId);
  };

  const dicePool = character[character.selectedAttribute] + character.craft;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatProjectTypeName = (type: ProjectType) => {
    return type
      .split("-")
      .map(capitalize)
      .join(" ");
  };
  
  const activeNarrativeCharms = allCharms.filter(
    (charm) =>
      diceRoll?.activeCharmIds.includes(charm.id) && charm.category === 'narrative'
  );

  const isWillForgingActive = activeCharms.includes("will-forging-discipline");

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
            <Select
              value={projectType}
              onValueChange={(v) => setProjectType(v as ProjectType)}
            >
              <SelectTrigger id="project-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                   <SelectItem key={type} value={type}>
                     {formatProjectTypeName(type)}
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {projectType.startsWith("superior-") && (
            <div>
              <Label htmlFor="artifact-rating" className="font-bold">
                Artifact Rating
              </Label>
              <Input
                id="artifact-rating"
                type="number"
                value={artifactRating}
                onChange={(e) =>
                  setArtifactRating(parseInt(e.target.value, 10))
                }
                min={2}
                max={5}
              />
            </div>
          )}
          <div>
            <Label htmlFor="objectives-met" className="font-bold">
              Objectives Met (0-3)
            </Label>
            <Input
              id="objectives-met"
              type="number"
              value={objectivesMet}
              onChange={(e) => setObjectivesMet(parseInt(e.target.value, 10))}
              min={0}
              max={3}
            />
          </div>
           <div>
            <Label htmlFor="target-number" className="font-bold">
              Target Number (TN)
            </Label>
            <Input
              id="target-number"
              type="number"
              value={targetNumber}
              onChange={(e) => setTargetNumber(parseInt(e.target.value, 10))}
              min={1}
            />
          </div>
           <div className="md:col-span-2">
            <Label htmlFor="assign-project" className="font-bold">
              Assign Roll to Project (Optional)
            </Label>
             <Select
              value={assignedProjectId}
              onValueChange={(v) => setAssignedProjectId(v === "none" ? undefined : v)}
            >
              <SelectTrigger id="assign-project">
                <SelectValue placeholder="Select project to add progress..." />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="none">
                    Don't assign to a project
                 </SelectItem>
                {activeProjects.map((proj) => (
                   <SelectItem key={proj.id} value={proj.id}>
                     {proj.name} ({proj.progress}/{proj.goal})
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           {isWillForgingActive && (
              <div className="md:col-span-2">
                  <Label htmlFor="willpower-spent" className="font-bold flex items-center gap-2">
                      Will-Forging Discipline
                  </Label>
                   <Input
                      id="willpower-spent"
                      type="number"
                      value={willpowerSpent}
                      onChange={(e) => setWillpowerSpent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      min={0}
                      max={character.willpower}
                      placeholder={`Spend WP (Max: ${character.willpower})`}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Spend Willpower to add 2 successes per point.</p>
              </div>
            )}
        </div>
        <Separator />
        <div className="text-center">
          <Button
            onClick={handleRollClick}
            disabled={isLoading}
            size="lg"
            className="font-headline text-xl"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Dices className="mr-2 h-6 w-6" />
            )}
            Roll {dicePool} Dice
          </Button>
        </div>
        {diceRoll && (
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-center font-headline">
              Roll Results
            </h3>
            {diceRoll.diceHistories.length > 0 && (
                <DiceDisplay waves={diceRoll.diceHistories} activeCharms={diceRoll.activeCharmIds}/>
            )}
            {diceRoll.totalSuccesses > 0 && (
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
            )}
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
