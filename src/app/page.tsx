"use client";

import { useState } from "react";
import type { Character, DiceRoll, AiOutcome, ProjectType } from "@/lib/types";
import { allCharms } from "@/lib/charms";
import { evaluateCraftingOutcome } from "@/ai/flows/evaluate-crafting-outcome";
import { useToast } from "@/hooks/use-toast";

import CharacterSheet from "@/components/character-sheet";
import CharmSelection from "@/components/charm-selection";
import DiceRoller from "@/components/dice-roller";
import CraftingJournal from "@/components/crafting-journal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hammer } from "lucide-react";

interface CraftingExperience {
  sxp: number;
  gxp: number;
  wxp: number;
}

export default function Home() {
  const [character, setCharacter] = useState<Character>({
    intelligence: 3,
    wits: 1,
    perception: 1,
    strength: 1,
    dexterity: 1,
    stamina: 1,
    charisma: 1,
    manipulation: 1,
    appearance: 1,
    craft: 3,
    essence: 1,
    motes: 10,
    selectedAttribute: "intelligence",
    knownCharms: allCharms.map((c) => c.id),
  });

  const [activeCharms, setActiveCharms] = useState<string[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(5);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [aiOutcome, setAiOutcome] = useState<AiOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [craftingXp, setCraftingXp] = useState<CraftingExperience>({
    sxp: 0,
    gxp: 0,
    wxp: 0,
  });
  const [activeProjects, setActiveProjects] = useState<any[]>([]);

  const handleRoll = async (projectDetails: {
    type: ProjectType;
    artifactRating: number;
    objectivesMet: number;
  }) => {
    setIsLoading(true);
    setDiceRoll(null);
    setAiOutcome(null);

    try {
      const dicePool =
        character[character.selectedAttribute] + character.craft;
      const selectedCharms = allCharms.filter((c) =>
        activeCharms.includes(c.id),
      );
      let charmEffectsDescription = "Applied Charms: ";
      let automaticSuccesses = 0;
      let willRerollFailures = false;
      let willRerollTens = false;
      let willDoubleNines = false;
      let moteCost = 0;

      selectedCharms.forEach((charm) => {
        charmEffectsDescription += `${charm.name}; `;
        if (charm.effect.type === "add_successes") {
          automaticSuccesses += charm.effect.value;
        }
        if (charm.effect.type === "reroll_failures") {
          willRerollFailures = true;
        }
        if (charm.effect.type === "reroll_tens") {
          willRerollTens = true;
        }
        if (charm.effect.type === "double_nines") {
          willDoubleNines = true;
        }
         // Parse mote cost
         if (charm.cost) {
          const match = charm.cost.match(/(\d+)m/);
          if (match) {
            moteCost += parseInt(match[1], 10);
          }
        }
      });
      if (selectedCharms.length === 0) {
        charmEffectsDescription = "None";
      }

      // Deduct motes
      setCharacter(prev => ({...prev, motes: prev.motes - moteCost}))

      const rollDice = (pool: number) =>
        Array.from({ length: pool }, () => Math.floor(Math.random() * 10) + 1);

      let initialRolls = rollDice(dicePool);
      let finalRolls = [...initialRolls];
      let rerolledIndices: number[] = [];

      // Handle rerolls
      if (willRerollFailures) {
        const failures = initialRolls.filter((r) => r < 7);
        const rerolledDice = rollDice(failures.length);
        const successesFromInitial = initialRolls.filter((r) => r >= 7);
        rerolledIndices = initialRolls
          .map((r, i) => (r < 7 ? i : -1))
          .filter((i) => i !== -1);
        finalRolls = [...successesFromInitial, ...rerolledDice];
      }

      if (willRerollTens) {
        let tensToReroll = finalRolls.filter((r) => r === 10).length;
        let bonusRolls: number[] = [];
        while (tensToReroll > 0) {
          const newRolls = rollDice(tensToReroll);
          bonusRolls.push(...newRolls);
          tensToReroll = newRolls.filter((r) => r === 10).length;
        }
        finalRolls.push(...bonusRolls);
      }

      const calculateSuccesses = (rolls: number[]) =>
        rolls.reduce((acc, roll) => {
          if (roll >= 10) return acc + 2;
          if (willDoubleNines && roll === 9) return acc + 2;
          if (roll >= 7) return acc + 1;
          return acc;
        }, 0);

      const baseSuccesses = calculateSuccesses(finalRolls);
      const totalSuccesses = baseSuccesses + automaticSuccesses;

      setDiceRoll({
        initialRolls,
        finalRolls,
        rerolledIndices,
        totalSuccesses,
        automaticSuccesses,
      });

      const isExceptional =
        (projectDetails.type.startsWith("basic-") ||
          projectDetails.type.startsWith("major-")) &&
        totalSuccesses >= targetNumber + 3;

      const aiResult = await evaluateCraftingOutcome({
        project: projectDetails,
        successes: totalSuccesses,
        targetNumber,
        charmEffects: charmEffectsDescription,
        isExceptional,
      });

      if (aiResult.isSuccess) {
        setCraftingXp((prev) => ({
          sxp: prev.sxp + aiResult.experienceGained.sxp,
          gxp: prev.gxp + aiResult.experienceGained.gxp,
          wxp: prev.wxp + aiResult.experienceGained.wxp,
        }));
      }

      setAiOutcome(aiResult);
    } catch (error) {
      console.error("Error evaluating crafting outcome:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to evaluate the crafting outcome. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex justify-center items-center gap-4 mb-2">
            <Hammer className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
              Exalted Crafter's Aid
            </h1>
          </div>
          <p className="font-body text-lg text-muted-foreground">
            Your assistant for epic crafting in the world of Exalted.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <CharacterSheet character={character} setCharacter={setCharacter} />
            <CharmSelection
              knownCharms={character.knownCharms}
              activeCharms={activeCharms}
              setActiveCharms={setActiveCharms}
            />
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="roller">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="roller">Dice Roller</TabsTrigger>
                <TabsTrigger value="journal">Crafting Journal</TabsTrigger>
              </TabsList>
              <TabsContent value="roller">
                <DiceRoller
                  character={character}
                  targetNumber={targetNumber}
                  setTargetNumber={setTargetNumber}
                  onRoll={handleRoll}
                  isLoading={isLoading}
                  diceRoll={diceRoll}
                  aiOutcome={aiOutcome}
                />
              </TabsContent>
              <TabsContent value="journal">
                <CraftingJournal
                  experience={craftingXp}
                  projects={activeProjects}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>
          Exalted and its concepts are trademarks of Onyx Path Publishing. This
          is an unofficial fan utility.
        </p>
      </footer>
    </div>
  );
}
