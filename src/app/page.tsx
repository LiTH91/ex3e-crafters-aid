
"use client";

import { useState, useEffect } from "react";
import type { Character, DiceRoll, CraftingOutcome, ProjectType, ActiveProject, CraftingExperience } from "@/lib/types";
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
import { Button } from "@/components/ui/button";

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
  craft: 3,
  essence: 1,
  personalMotes: 10,
  peripheralMotes: 25,
  willpower: 5,
  selectedAttribute: "intelligence",
  knownCharms: allCharms.map((c) => c.id),
};

const initialExperience: CraftingExperience = {
  sxp: 0,
  gxp: 0,
  wxp: 0,
}

interface AppState {
  character: Character;
  activeCharms: string[];
  craftingXp: CraftingExperience;
  activeProjects: ActiveProject[];
}

const ANIMATION_DELAY = 150;

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    character: initialCharacter,
    activeCharms: [],
    craftingXp: initialExperience,
    activeProjects: [],
  });

  const [targetNumber, setTargetNumber] = useState<number>(5);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [outcome, setOutcome] = useState<CraftingOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("exaltedCrafterState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Basic validation to ensure essential keys exist
        if (parsedState.character && parsedState.activeProjects) {
            setAppState(parsedState);
        }
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = JSON.stringify(appState);
      localStorage.setItem("exaltedCrafterState", stateToSave);
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [appState]);

  const handleStateChange = <K extends keyof AppState>(key: K, value: AppState[K] | ((prevState: AppState[K]) => AppState[K])) => {
    setAppState(prev => {
        const newValue = typeof value === 'function' ? (value as (prevState: AppState[K]) => AppState[K])(prev[key]) : value;
        return { ...prev, [key]: newValue };
    });
  };

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

    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const { character, activeCharms } = appState;

      let moteCost = 0;
      let willpowerCost = 0;
      let sxpCost = 0;
      let gxpCost = 0;
      let wxpCost = 0;
      let tnModifier = 0;

      const activeCharmDetails: { id: string; name: string; cost?: string; effect: any }[] = [];
      
      allCharms.forEach(charm => {
          if (activeCharms.includes(charm.id)) {
              activeCharmDetails.push(charm);
          }
          if (charm.subEffects) {
              charm.subEffects.forEach(subCharm => {
                  if (activeCharms.includes(subCharm.id)) {
                      activeCharmDetails.push(subCharm);
                  }
              });
          }
      });
      
      let automaticSuccesses = 0;
      let willRerollFailures = false;

      activeCharmDetails.forEach((charm) => {
        if (charm.effect.type === "add_successes") automaticSuccesses += charm.effect.value;
        else if (charm.effect.type === "reroll_failures") willRerollFailures = true;
        else if (charm.effect.type === "lower_repair_difficulty" && projectDetails.type.includes("repair")) tnModifier -= charm.effect.value;

         if (charm.cost) {
            const moteMatch = charm.cost.match(/(\d+)m/);
            if (moteMatch) moteCost += parseInt(moteMatch[1], 10);
            
            const willpowerMatch = charm.cost.match(/(\d+)wp/);
            if (willpowerMatch) willpowerCost += parseInt(willpowerMatch[1], 10);

            const sxpMatch = charm.cost.match(/(\d+)sxp/);
            if (sxpMatch) sxpCost += parseInt(sxpMatch[1], 10);

            const gxpMatch = charm.cost.match(/(\d+)gxp/);
            if (gxpMatch) gxpCost += parseInt(gxpMatch[1], 10);

            const wxpMatch = charm.cost.match(/(\d+)wxp/);
            if (wxpMatch) wxpCost += parseInt(wxpMatch[1], 10);
          }
      });

      // --- Spend Costs ---
      handleStateChange('character', prev => {
        let personal = prev.personalMotes;
        let peripheral = prev.peripheralMotes;
        let remainingMoteCost = moteCost;
        const personalToSpend = Math.min(personal, remainingMoteCost);
        personal -= personalToSpend;
        remainingMoteCost -= personalToSpend;
        const peripheralToSpend = Math.min(peripheral, remainingMoteCost);
        peripheral -= peripheralToSpend;
        return { ...prev, personalMotes: personal, peripheralMotes: peripheral, willpower: prev.willpower - willpowerCost };
      });

      handleStateChange('craftingXp', prev => ({
          ...prev,
          sxp: prev.sxp - sxpCost,
          gxp: prev.gxp - gxpCost,
          wxp: prev.wxp - wxpCost,
      }));

      const rollDie = () => Math.floor(Math.random() * 10) + 1;
      
      const dicePool = character[character.selectedAttribute] + character.craft;
      const initialRolls = Array.from({ length: dicePool }, rollDie);
      
      let diceHistories: number[][] = initialRolls.map(r => [r]);
      
      const updateDiceRoll = (histories: number[][], charms: string[]) => {
         setDiceRoll({ 
            diceHistories: histories.map(h => [...h]),
            totalSuccesses: 0,
            automaticSuccesses: 0,
            targetNumber: 0,
            activeCharmNames: charms,
        });
      }

      const shouldDieExplode = (roll: number, currentActiveCharms: string[]): boolean => {
        const hasExplodingTens = currentActiveCharms.includes("flawless-handiwork-method");
        const doubleSuccessLevel1 = currentActiveCharms.includes('supreme-masterwork-focus-1');
        const doubleSuccessLevel2 = currentActiveCharms.includes('supreme-masterwork-focus-2');
        const doubleSuccessLevel3 = currentActiveCharms.includes('supreme-masterwork-focus-3');

        if (hasExplodingTens && roll === 10) return true;
        if (doubleSuccessLevel1 && roll === 9) return true;
        if (doubleSuccessLevel2 && roll === 8) return true;
        if (doubleSuccessLevel3 && roll === 7) return true;
        return false;
      };

      // --- Initial Roll Display ---
      updateDiceRoll(diceHistories, activeCharmDetails.map(c => c.name));
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));


      // --- Sequential Explosion Logic (Row by Row) ---
      while(true) {
        let explosionsInThisPass = 0;
        
        // Use a copy of the histories to iterate over, while modifying the original
        const currentHistories = [...diceHistories];
        
        for (let i = 0; i < currentHistories.length; i++) {
          const history = diceHistories[i];
          const lastRoll = history[history.length - 1];

          // Check if this die has already exploded in this pass
          // This check is tricky. A simpler way is to check the length.
          // We only check a die for explosion if its history length is exactly the current pass number.
          // This doesn't quite work.
          // Let's use a flag on the history or check its length relative to the pass.
          // The issue is a die might explode multiple times.

          // Simplified approach: iterate through all chains and if the LAST die can explode, explode it.
          // This is what we want.
           if (shouldDieExplode(lastRoll, activeCharms)) {
              // We only want to explode a die once per pass.
              // A die chain can only have one explosion per pass.
              // This is implicit if we only check the last die.
              
              // Let's create a map to track which die chains have already exploded in this pass
              // This is getting complicated. Let's try a simpler loop.
           }
        }

        const newDiceHistories = [...diceHistories];
        for(let i = 0; i < newDiceHistories.length; i++) {
             const history = newDiceHistories[i];
             const lastRoll = history[history.length -1];
              if(shouldDieExplode(lastRoll, activeCharms)){
                 // to avoid re-exploding an already exploded die in the same pass, we need a check.
                 // The easiest check is to see if we've already added to it.
                 // This requires a different loop structure.

                 // Let's try this:
                 // 1. Find all dice that need to explode.
                 // 2. Roll new dice for them.
                 // 3. Add the new dice to their histories.
                 // 4. Repeat.
              }
        }
        
        // New strategy based on "row by row"
        let newExplosions = [];
        for (const history of diceHistories) {
            const lastRoll = history[history.length - 1];
            if (shouldDieExplode(lastRoll, activeCharms)) {
                newExplosions.push(history);
            }
        }

        if (newExplosions.length > 0) {
            explosionsInThisPass = newExplosions.length;
            for (const history of newExplosions) {
                history.push(rollDie());
            }
            updateDiceRoll(diceHistories, activeCharmDetails.map(c => c.name));
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY * 2));
        } else {
            // No explosions in this pass, so we're done with explosions.
            break;
        }
      }


      // --- Handle Reroll Failures ---
      if (willRerollFailures) {
          let hadRerolls = false;
          for (const history of diceHistories) {
             const lastRoll = history[history.length - 1];
             if(lastRoll < 7) {
                 history.push(rollDie());
                 hadRerolls = true;
             }
          }
          if (hadRerolls) {
            updateDiceRoll(diceHistories, activeCharmDetails.map(c => c.name));
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
          }
      }
      
      const calculateSuccesses = (roll: number, currentActiveCharms: string[]) => {
        const doubleSuccessLevel1 = currentActiveCharms.includes('supreme-masterwork-focus-1');
        const doubleSuccessLevel2 = currentActiveCharms.includes('supreme-masterwork-focus-2');
        const doubleSuccessLevel3 = currentActiveCharms.includes('supreme-masterwork-focus-3');

        if (roll >= 10) return 2;
        if (doubleSuccessLevel3 && roll >= 7) return 2;
        if (doubleSuccessLevel2 && roll >= 8) return 2;
        if (doubleSuccessLevel1 && roll >= 9) return 2;
        if (roll >= 7) return 1;
        return 0;
      };
      
      const baseSuccesses = diceHistories.reduce((total, history) => {
          const finalRoll = history[history.length - 1];
          return total + calculateSuccesses(finalRoll, activeCharms);
      }, 0);

      const totalSuccesses = baseSuccesses + automaticSuccesses;
      const finalTargetNumber = Math.max(1, targetNumber + tnModifier);

      setDiceRoll(prev => ({ 
        ...prev!,
        diceHistories,
        totalSuccesses, 
        automaticSuccesses, 
        targetNumber: finalTargetNumber
      }));

      const isExceptional = (projectDetails.type.startsWith("basic-") || projectDetails.type.startsWith("major-")) && totalSuccesses >= finalTargetNumber + 3;

      const result = calculateCraftingOutcome({ project: projectDetails, successes: totalSuccesses, targetNumber: finalTargetNumber, isExceptional });

      if (result.isSuccess) {
        handleStateChange('craftingXp', prev => ({
          sxp: prev.sxp + result.experienceGained.sxp,
          gxp: prev.gxp + result.experienceGained.gxp,
          wxp: prev.wxp + result.experienceGained.wxp,
        }));

        if (assignedProjectId) {
          handleStateChange('activeProjects', prevProjects => 
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
      toast({ variant: "destructive", title: "Error", description: "Failed to calculate the crafting outcome. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
        localStorage.removeItem("exaltedCrafterState");
        setAppState({
            character: initialCharacter,
            activeCharms: [],
            craftingXp: initialExperience,
            activeProjects: [],
        });
        setDiceRoll(null);
        setOutcome(null);
        setTargetNumber(5);
        toast({ title: "Data Reset", description: "All character data and projects have been reset." });
    }
  }

  const { character, activeCharms, craftingXp, activeProjects } = appState;
  const hasTirelessWorkhorse = activeCharms.includes("tireless-workhorse-method");
  const majorProjectSlots = hasTirelessWorkhorse ? character.essence * 2 : 0;

  const addProject = (project: Omit<ActiveProject, 'id' | 'isComplete'>) => {
    handleStateChange('activeProjects', prev => [...prev, { ...project, id: crypto.randomUUID(), isComplete: false }]);
  }

  const removeProject = (projectId: string) => {
    handleStateChange('activeProjects', prev => prev.filter(p => p.id !== projectId));
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
            <CharacterSheet 
              character={character} 
              setCharacter={(value) => handleStateChange('character', value)} 
            />
            <CharmSelection
              knownCharms={character.knownCharms}
              activeCharms={activeCharms}
              setActiveCharms={(value) => handleStateChange('activeCharms', value)}
              character={character}
              experience={craftingXp}
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
        <Button variant="outline" onClick={resetState} className="mb-4">Reset All Data</Button>
        <p>
          Exalted and its concepts are trademarks of Onyx Path Publishing. This
          is an unofficial fan utility.
        </p>
      </footer>
    </div>
  );
}
    
    
