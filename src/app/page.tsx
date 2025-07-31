"use client";

import { useState, useEffect, useCallback } from "react";
import type { Character, DiceRoll, CraftingOutcome, ProjectCategory, ActiveProject, JournalEntry } from "@/lib/types";
import { calculateCraftingOutcome } from "@/lib/crafting-calculator";
import { performDiceRoll } from "@/lib/dice-logic";
import { useToast } from "@/hooks/use-toast";

import CharacterSheet from "@/components/character-sheet";
import CharmSelection from "@/components/charm-selection";
import DiceRoller from "@/components/dice-roller";
import CraftingJournal from "@/components/crafting-journal";
import CraftingReference from "@/components/crafting-reference";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const initialCharacter: Character = {
  intelligence: 3,
  wits: 1,
  perception: 1,
  strength: 1,
  dexterity: 1,
  stamina: 1,
  charisma: 1,
  manipulation: 1,
  appearance: 1,
  craft: 5,
  specialty: 0,
};

const HomePage = () => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [craftingOutcome, setCraftingOutcome] = useState<CraftingOutcome | null>(null);
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>("mundane");
  const [targetNumber, setTargetNumber] = useState<number>(7);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage on component mount
    setIsLoading(true);
    const savedCharacter = localStorage.getItem("character");
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter));
    }
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
    setIsLoading(false);
  }, []);

  const handleCharacterChange = (field: keyof Character, value: number) => {
    const newCharacter = { ...character, [field]: value };
    setCharacter(newCharacter);
    localStorage.setItem("character", JSON.stringify(newCharacter));
  };

  const handleRollDice = (pool: number) => {
    const roll = performDiceRoll(pool, targetNumber);
    setDiceRoll(roll);
    toast({
      title: "Dice Rolled!",
      description: `You rolled ${roll.successes} successes with ${roll.rolledDice.length} dice.`,
    });

    // Directly calculate and set outcome after rolling
    const outcome = calculateCraftingOutcome(roll.successes, projectCategory, character);
    setCraftingOutcome(outcome);
    toast({
      title: "Crafting Potential Assessed!",
      description: `You can achieve ${outcome.successes} successes, taking ${outcome.time}.`,
    });
  };

  const handleFinishProject = useCallback(() => {
    if (!craftingOutcome) {
       toast({ title: "Error", description: "No crafting outcome to record.", variant: "destructive" });
      return;
    }

    const newEntry: JournalEntry = {
      id: new Date().toISOString(),
      projectName: `My ${projectCategory} Project`, // Placeholder name
      date: new Date().toISOString(),
      notes: "A successful crafting venture.", // Placeholder notes
      category: projectCategory,
      outcome: craftingOutcome,
    };

    const newEntries = [...journalEntries, newEntry];
    setJournalEntries(newEntries);
    localStorage.setItem("journalEntries", JSON.stringify(newEntries));

    // Reset for next project
    setCraftingOutcome(null);
    setDiceRoll(null);

    toast({
      title: "Project Finished!",
      description: "The project has been added to your journal.",
    });
  }, [craftingOutcome, journalEntries, projectCategory, toast]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      );
    }

    return (
      <TabsContent value="main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CharacterSheet
            character={character}
            onCharacterChange={handleCharacterChange}
          />
          <div className="space-y-6">
            <CharmSelection />
            <DiceRoller
              character={character}
              onRoll={handleRollDice}
              diceRoll={diceRoll}
              targetNumber={targetNumber}
              setTargetNumber={setTargetNumber}
            />
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Project Controls</h3>
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="project-category">Project Category:</label>
                <select
                  id="project-category"
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value as ProjectCategory)}
                  className="p-2 border rounded"
                >
                  <option value="mundane">Mundane</option>
                  <option value="superior">Superior</option>
                  <option value="artifact">Artifact</option>
                </select>
              </div>

              <Button onClick={handleFinishProject} disabled={!craftingOutcome}>
                Finish & Journal Project
              </Button>

            </div>
            {craftingOutcome && (
              <div className="mt-4 p-4 border rounded-lg bg-secondary">
                <h3 className="text-xl font-bold">Crafting Outcome</h3>
                <p>Successes: {craftingOutcome.successes}</p>
                <p>Time Required: {craftingOutcome.time}</p>
                <p>Resources: {craftingOutcome.resources}</p>
                {craftingOutcome.notes && <p className="mt-2 text-sm italic">{craftingOutcome.notes}</p>}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    );
  }


  return (
    <main className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Hammer className="w-8 h-8" /> Ex3e Crafter's Aid
        </h1>
        <div>
          <Button onClick={() => setIsJournalOpen(true)} variant="outline">
            Crafting Journal
          </Button>
        </div>
      </header>

      <Tabs defaultValue="main" className="w-full">
        <TabsList>
          <TabsTrigger value="main">Main Crafter</TabsTrigger>
          <TabsTrigger value="reference">Quick Reference</TabsTrigger>
        </TabsList>
        {renderContent()}
        <TabsContent value="reference">
          <CraftingReference />
        </TabsContent>
      </Tabs>


      <CraftingJournal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
      />
    </main>
  );
};

export default HomePage;
