"use client";

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
import { Dices, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DiceRollerProps {
  targetNumber: number;
  setTargetNumber: (value: number) => void;
  onRoll: () => void;
  isLoading: boolean;
  diceRoll: DiceRoll | null;
  aiOutcome: AiOutcome | null;
  character: Character;
}

const Dice = ({ value, isRerolled }: { value: number; isRerolled?: boolean }) => {
  const getColor = () => {
    if (value >= 10) return "text-accent-foreground bg-accent";
    if (value >= 7) return "text-primary-foreground bg-primary/80";
    return "text-muted-foreground bg-muted";
  };
  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-md font-bold text-lg ${getColor()} transition-colors duration-300 relative`}>
      {value}
      {isRerolled && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" title="Rerolled"></div>}
    </div>
  );
};

export default function DiceRoller({
  targetNumber,
  setTargetNumber,
  onRoll,
  isLoading,
  diceRoll,
  aiOutcome,
  character,
}: DiceRollerProps) {
  const dicePool = character.intelligence + character.craft;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg h-full">
      <CardHeader>
         <div className="flex items-center gap-3">
          <Dices className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">Crafting Roll</CardTitle>
            <CardDescription className="font-body">
              Set the difficulty and roll the dice.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
          <div className="space-y-2">
            <Label htmlFor="targetNumber" className="font-bold text-lg font-body">Target Successes</Label>
            <Input
              id="targetNumber"
              type="number"
              value={targetNumber}
              onChange={(e) => setTargetNumber(parseInt(e.target.value, 10) || 1)}
              min="1"
              className="bg-background"
            />
          </div>
          <div className="text-center">
            <p className="font-body text-muted-foreground">Dice Pool</p>
            <p className="font-headline text-3xl font-bold text-primary">{dicePool}</p>
          </div>
          <Button onClick={onRoll} disabled={isLoading} className="w-full md:w-auto justify-self-end text-lg py-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Rolling...
              </>
            ) : (
              "Roll Dice"
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 font-body text-lg text-muted-foreground">The loom of fate weaves your destiny...</p>
          </div>
        )}
        
        {diceRoll && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <Separator />
            <div>
              <h3 className="font-headline text-xl text-primary mb-3">Dice Results</h3>
              <div className="flex flex-wrap gap-2">
                {diceRoll.initialRolls.map((roll, index) => (
                  <Dice key={index} value={roll} isRerolled={diceRoll.rerolledIndices.includes(index)} />
                ))}
              </div>
              {diceRoll.rerolledIndices.length > 0 && 
                <p className="text-sm mt-2 text-muted-foreground italic">* Red-dotted dice were rerolled due to a Charm effect.</p>
              }
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="font-body text-muted-foreground">Automatic Successes</p>
                    <p className="font-headline text-3xl font-bold text-primary">{diceRoll.automaticSuccesses}</p>
                </div>
                 <div className="p-4 bg-primary/20 rounded-lg">
                    <p className="font-body text-primary">Total Successes</p>
                    <p className="font-headline text-4xl font-bold text-primary">{diceRoll.totalSuccesses}</p>
                </div>
            </div>

            {aiOutcome && (
                <div className="mt-6">
                    <Separator />
                    <div className="mt-6 p-6 rounded-lg bg-accent/20 border border-accent">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-7 h-7 text-accent-foreground" />
                            <h3 className="font-headline text-xl text-accent-foreground">Outcome Evaluation</h3>
                        </div>
                        <div className={`flex items-center gap-2 mb-4 font-bold text-lg ${aiOutcome.isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                            {aiOutcome.isSuccess ? <CheckCircle2 /> : <XCircle />}
                            <span>{aiOutcome.isSuccess ? "Success!" : "Failure"}</span>
                        </div>
                        <p className="font-body text-foreground/90 whitespace-pre-wrap">{aiOutcome.outcomeDescription}</p>
                    </div>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
