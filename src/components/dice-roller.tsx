"use client";

import { useState } from "react";
import type { DiceRoll, AiOutcome, Character } from "@/lib/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dices,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Hammer,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DiceRollerProps {
  character: Character;
  targetNumber: number;
  setTargetNumber: (value: number) => void;
  onRoll: (projectDetails: {
    type: "Basic" | "Major" | "Superior" | "Legendary";
    isRepair: boolean;
    artifactRating: number;
    objectivesMet: number;
  }) => void;
  isLoading: boolean;
  diceRoll: DiceRoll | null;
  aiOutcome: AiOutcome | null;
}

type ProjectType = "Basic" | "Major" | "Superior" | "Legendary";

export default function DiceRoller({
  character,
  targetNumber,
  setTargetNumber,
  onRoll,
  isLoading,
  diceRoll,
  aiOutcome,
}: DiceRollerProps) {
  const [projectType, setProjectType] = useState<ProjectType>("Basic");
  const [isRepair, setIsRepair] = useState(false);
  const [artifactRating, setArtifactRating] = useState(2);
  const [objectivesMet, setObjectivesMet] = useState(1);

  const handleRollClick = () => {
    onRoll({
      type: projectType,
      isRepair,
      artifactRating: projectType === "Superior" ? artifactRating : 0,
      objectivesMet,
    });
  };

  const dicePool = character[character.selectedAttribute] + character.craft;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Major">Major</SelectItem>
                <SelectItem value="Superior">Superior</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {projectType === "Superior" && (
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
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="is-repair"
              checked={isRepair}
              onCheckedChange={(c) => setIsRepair(c as boolean)}
            />
            <Label htmlFor="is-repair" className="font-bold">
              Is this a repair?
            </Label>
          </div>
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
            <div className="flex justify-center gap-2 flex-wrap">
              {diceRoll.initialRolls.map((roll, index) => (
                <span
                  key={index}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                    diceRoll.rerolledIndices.includes(index)
                      ? "bg-muted text-muted-foreground line-through"
                      : roll >= 10
                        ? "bg-yellow-400 text-black"
                        : roll >= 7
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                  }`}
                >
                  {roll}
                </span>
              ))}
            </div>
            {diceRoll.rerolledIndices.length > 0 && (
              <>
                <p className="text-center text-sm font-body">
                  Rerolled {diceRoll.rerolledIndices.length} failures.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {diceRoll.finalRolls
                    .slice(
                      diceRoll.initialRolls.length -
                        diceRoll.rerolledIndices.length,
                    )
                    .map((roll, index) => (
                      <span
                        key={index}
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                          roll >= 10
                            ? "bg-yellow-400 text-black"
                            : roll >= 7
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                        }`}
                      >
                        {roll}
                      </span>
                    ))}
                </div>
              </>
            )}
            <div className="text-center font-bold text-2xl font-headline flex items-center justify-center gap-2">
              {diceRoll.totalSuccesses >= targetNumber ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <span>
                {diceRoll.totalSuccesses} Successes vs TN {targetNumber}
              </span>
            </div>
          </div>
        )}
        {aiOutcome && (
          <Card className="mt-6 bg-background/50">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI-Powered Outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-body text-base">
              <p>
                <span className="font-bold">Outcome: </span>
                {aiOutcome.outcome}
              </p>
              <p>
                <span className="font-bold">Rewards: </span>
                {aiOutcome.rewards}
              </p>
              <p className="pt-2 italic">{aiOutcome.narrative}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
