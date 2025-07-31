"use client";

import { useState, useEffect, useCallback } from "react";
import type { Character, DiceRoll, CraftingOutcome, ProjectType, ActiveProject, CraftingExperience } from "@/lib/types";
import { allCharms } from "@/lib/charms";
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
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

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
  occult: 0,
  medicine: 0,
  larceny: 0,
  sail: 0,
  performance: 0,
  survival: 0,
  investigation: 0,
  lore: 0,
  athletics: 0,
  awareness: 0,
  bureaucracy: 0,
  integrity: 0,
  melee: 0,
  presence: 0,
  resistance: 0,
  ride: 0,
  socialize: 0,
  stealth: 0,
  war: 0,
  archery: 0,
  brawl: 0,
  dodge: 0,
  linguistics: 0,
  thrown: 0,
  specialty: 0,
};

const HomePage = () => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [craftingOutcome, setCraftingOutcome] = useState<CraftingOutcome | null>(null);
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);
  const [projectType, setProjectType] = useState<ProjectType>("mundane");
  const [targetNumber, setTargetNumber] = useState<number>(7);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [craftingExperiences, setCraftingExperiences] = useState<CraftingExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Adjust time as needed

    // Load data from localStorage on component mount
    const savedCharacter = localStorage.getItem("character");
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter));
    }
    const savedExperiences = localStorage.getItem("craftingExperiences");
    if (savedExperiences) {
      setCraftingExperiences(JSON.parse(savedExperiences));
    }
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
  };

  const handleStartProject = useCallback(() => {
    if (!diceRoll) {
      toast({
        title: "Error",
        description: "You must roll the dice first.",
        variant: "destructive",
      });
      return;
    }

    const outcome = calculateCraftingOutcome(diceRoll.successes, projectType, character);
    setCraftingOutcome(outcome);
    const newProject = {
      ...outcome,
      projectType,
      characterStats: character,
      diceRoll,
      isFinished: false,
    };
    setActiveProject(newProject);

    toast({
      title: "Project Started!",
      description: `Your ${projectType} project has begun. You achieved ${outcome.successes} successes.`,
    });
  }, [diceRoll, projectType, character, toast]);


  const handleFinishProject = useCallback(() => {
    if (activeProject) {
      const finishedProject: CraftingExperience = {
        ...activeProject,
        isFinished: true,
        projectName: "My Great Work", // Placeholder for user input
        notes: "This was a challenging but rewarding project.", // Placeholder
        date: new Date().toISOString(),
      };
      const newExperiences = [...craftingExperiences, finishedProject];
      setCraftingExperiences(newExperiences);
      localStorage.setItem("craftingExperiences", JSON.stringify(newExperiences));
      setActiveProject(null);
      setCraftingOutcome(null);
      setDiceRoll(null);
      toast({
        title: "Project Finished!",
        description: "The project has been added to your journal.",
      });
    }
  }, [activeProject, craftingExperiences, toast]);


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
                <label htmlFor="project-type">Project Type:</label>
                <select
                  id="project-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="p-2 border rounded"
                >
                  <option value="mundane">Mundane</option>
                  <option value="superior">Superior</option>
                  <option value="artifact">Artifact</option>
                </select>
              </div>

              {!activeProject ? (
                <Button onClick={handleStartProject} disabled={!diceRoll}>
                  Start Project
                </Button>
              ) : (
                <Button onClick={handleFinishProject}>
                  Finish & Journal Project
                </Button>
              )}

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
        experiences={craftingExperiences}
      />
    </main>
  );
};

export default HomePage;
