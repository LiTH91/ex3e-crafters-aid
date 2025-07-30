"use client";

import { useState } from "react";
import type { Character, DiceRoll, CraftingOutcome, ProjectType, ActiveProject } from "@/lib/types";
import { allCharms } from "@/lib/charms";
import { calculateCraftingOutcome } from "@/lib/crafting-calculator";
import { useToast } from "@/hooks/use-toast";

import CharacterSheet from "@/components/character-sheet";
import CharmSelection from "@/components/charm-selection";
import DiceRoller from "@/components/dice-roller";
import CraftingJournal from "@/components/crafting-journal";
import CraftingReference from "@/components/crafting-reference";
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
    personalMotes: 10,
    peripheralMotes: 25,
    willpower: 5,
    selectedAttribute: "intelligence",
    knownCharms: allCharms.map((c) => c.id),
  });

  const [activeCharms, setActiveCharms] = useState<string[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(5);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [outcome, setOutcome] = useState<CraftingOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [craftingXp, setCraftingXp] = useState<CraftingExperience>({
    sxp: 0,
    gxp: 0,
    wxp: 0,
  });
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);

  const handleRoll = async (
    projectDetails: {
      type: ProjectType;
      artifactRating: number;
      objectivesMet: number;
    },
    assignedProjectId?: string
  ) => {
    setIsLoading(true);
    setDiceRoll(null);
    setOutcome(null);

    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const dicePool =
        character[character.selectedAttribute] + character.craft;
      const selectedCharms = allCharms.filter((c) =>
        activeCharms.includes(c.id),
      );
      
      let automaticSuccesses = 0;
      let willRerollFailures = false; // Placeholder for future implementation
      let willRerollTens = false;
      let willDoubleNines = false;
      let moteCost = 0;
      let willpowerCost = 0;
      let tnModifier = 0;

      selectedCharms.forEach((charm) => {
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
        if (charm.effect.type === "lower_repair_difficulty" && projectDetails.type.includes("repair")) {
          tnModifier -= charm.effect.value;
        }

         // Parse costs
         if (charm.cost) {
            const moteMatch = charm.cost.match(/(\d+)m/);
            if (moteMatch) {
              moteCost += parseInt(moteMatch[1], 10);
            }
            const willpowerMatch = charm.cost.match(/(\d+)wp/);
            if (willpowerMatch) {
              willpowerCost += parseInt(willpowerMatch[1], 10);
            }
          }
      });

      // Deduct resources
      setCharacter(prev => {
        let personal = prev.personalMotes;
        let peripheral = prev.peripheralMotes;

        let remainingMoteCost = moteCost;
        
        const personalToSpend = Math.min(personal, remainingMoteCost);
        personal -= personalToSpend;
        remainingMoteCost -= personalToSpend;

        const peripheralToSpend = Math.min(peripheral, remainingMoteCost);
        peripheral -= peripheralToSpend;

        return {
            ...prev, 
            personalMotes: personal,
            peripheralMotes: peripheral,
            willpower: prev.willpower - willpowerCost
        }
      });

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

      let tensToReroll = finalRolls.filter(r => r === 10).length;

      // Handle reroll 10s
      if (willRerollTens) {
          while(tensToReroll > 0) {
              const newRolls = rollDice(tensToReroll);
              const originalLength = finalRolls.length;
              finalRolls.push(...newRolls);
              // Mark original 10s as "rerolled" for visual feedback
              for(let i = 0; i < originalLength; i++) {
                  if(finalRolls[i] === 10 && !rerolledIndices.includes(i)) {
                      rerolledIndices.push(i);
                  }
              }
              tensToReroll = newRolls.filter(r => r === 10).length;
          }
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
      const finalTargetNumber = Math.max(1, targetNumber + tnModifier);

      setDiceRoll({
        initialRolls,
        finalRolls,
        rerolledIndices,
        totalSuccesses,
        automaticSuccesses,
        targetNumber: finalTargetNumber
      });

      const isExceptional =
        (projectDetails.type.startsWith("basic-") ||
          projectDetails.type.startsWith("major-")) &&
        totalSuccesses >= finalTargetNumber + 3;

      const result = calculateCraftingOutcome({
        project: projectDetails,
        successes: totalSuccesses,
        targetNumber: finalTargetNumber,
        isExceptional,
      });

      if (result.isSuccess) {
        setCraftingXp((prev) => ({
          sxp: prev.sxp + result.experienceGained.sxp,
          gxp: prev.gxp + result.experienceGained.gxp,
          wxp: prev.wxp + result.experienceGained.wxp,
        }));

        // Update project progress
        if (assignedProjectId) {
          setActiveProjects(prevProjects => 
            prevProjects.map(p => {
              if (p.id === assignedProjectId) {
                const newProgress = p.progress + totalSuccesses;
                const isComplete = newProgress >= p.goal;
                if(isComplete) {
                    toast({ title: "Project Complete!", description: `You have completed "${p.name}".`});
                }
                return { ...p, progress: newProgress, isComplete };
              }
              return p;
            })
          );
        }
      }

      setOutcome(result);
    } catch (error) {
      console.error("Error calculating crafting outcome:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to calculate the crafting outcome. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasTirelessWorkhorse = activeCharms.includes("tireless-workhorse-method");
  const majorProjectSlots = hasTirelessWorkhorse ? character.essence * 2 : 0;

  const addProject = (project: Omit<ActiveProject, 'id' | 'isComplete'>) => {
    const newProject: ActiveProject = {
        ...project,
        id: crypto.randomUUID(),
        isComplete: false,
    };
    setActiveProjects(prev => [...prev, newProject]);
  }

  const removeProject = (projectId: string) => {
    setActiveProjects(prev => prev.filter(p => p.id !== projectId));
  }


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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roller">Dice Roller</TabsTrigger>
                <TabsTrigger value="journal">Crafting Journal</TabsTrigger>
                <TabsTrigger value="reference">Crafting Reference</TabsTrigger>
              </TabsList>
              <TabsContent value="roller">
                <DiceRoller
                  character={character}
                  targetNumber={targetNumber}
                  setTargetNumber={setTargetNumber}
                  onRoll={handleRoll}
                  isLoading={isLoading}
                  diceRoll={diceRoll}
                  aiOutcome={outcome}
                  activeProjects={activeProjects.filter(p => !p.isComplete)}
                />
              </TabsContent>
              <TabsContent value="journal">
                <CraftingJournal
                  experience={craftingXp}
                  projects={activeProjects}
                  maxProjects={majorProjectSlots}
                  onAddProject={addProject}
                  onRemoveProject={removeProject}
                />
              </TabsContent>
               <TabsContent value="reference">
                <CraftingReference />
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
