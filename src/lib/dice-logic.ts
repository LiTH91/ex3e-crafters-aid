
import type { Character, DiceRoll } from "./types";
import { allCharms } from "./charms";

const ANIMATION_DELAY = 100;

// --- Helper Functions ---

const rollDie = () => Math.floor(Math.random() * 10) + 1;

const shouldDieExplode = (roll: number, activeCharms: string[]): boolean => {
  if (activeCharms.includes("flawless-handiwork-method") && roll === 10) return true;
  if (activeCharms.includes('supreme-masterwork-focus-3') && roll >= 7) return true;
  if (activeCharms.includes('supreme-masterwork-focus-2') && roll >= 8) return true;
  if (activeCharms.includes('supreme-masterwork-focus-1') && roll >= 9) return true;
  return false;
};

const calculateSuccesses = (roll: number, activeCharms: string[]) => {
  const smf1 = activeCharms.includes('supreme-masterwork-focus-1');
  const smf2 = activeCharms.includes('supreme-masterwork-focus-2');
  const smf3 = activeCharms.includes('supreme-masterwork-focus-3');

  if (roll >= 10) return 2;
  // Note: These need to be checked from most to least powerful, as a higher charm implies the lower one is active.
  if (smf3 && roll >= 7) return 2; 
  if (smf2 && roll >= 8) return 2;
  if (smf1 && roll >= 9) return 2;
  if (roll >= 7) return 1;
  return 0;
};

// --- Main Logic Function ---

interface DiceRollInput {
  character: Character;
  activeCharms: string[];
  targetNumber: number;
  onProgress: (interimRoll: DiceRoll) => void;
}

export const performDiceRoll = async (input: DiceRollInput): Promise<DiceRoll> => {
    const { character, activeCharms, targetNumber, onProgress } = input;
    
    await new Promise(resolve => setTimeout(resolve, 50));

    const initialDicePool = character[character.selectedAttribute] + character.craft;
    const allRolls: number[][] = [];
    let totalSuccesses = 0;
    
    // --- Step 1: Initial Roll & Reroll ---
    let firstWaveRolls = Array.from({ length: initialDicePool }, rollDie);
    let diceToExplode: number[] = [];

    const willRerollFailures = activeCharms.includes("first-movement-of-the-demiurge");
    if (willRerollFailures) {
        // Show the pre-reroll dice for a moment
        allRolls.push([...firstWaveRolls]);
        onProgress({
            diceHistories: allRolls, totalSuccesses: 0, automaticSuccesses: 0, targetNumber, activeCharmNames: [], activeCharmIds: []
        });
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY + 200));

        // Reroll failures and update the first wave
        const rerolledWave = firstWaveRolls.map(die => (die < 7 ? rollDie() : die));
        allRolls[0] = rerolledWave; // Replace the first wave with the rerolled dice
        firstWaveRolls = rerolledWave;
    } else {
        allRolls.push(firstWaveRolls);
    }
    
    // Calculate successes and gather explosions for the first wave
    for (const die of firstWaveRolls) {
        totalSuccesses += calculateSuccesses(die, activeCharms);
        if (shouldDieExplode(die, activeCharms)) {
            diceToExplode.push(die);
        }
    }

    // Update progress after the first wave is fully processed
    onProgress({
        diceHistories: allRolls,
        totalSuccesses,
        automaticSuccesses: 0, 
        targetNumber,
        activeCharmNames: [],
        activeCharmIds: []
    });
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));


    // --- Step 2: Explosion Loop (Waves) ---
    let diceForNextWave = diceToExplode.length;

    while (diceForNextWave > 0) {
        const currentWaveRolls = Array.from({ length: diceForNextWave }, rollDie);
        allRolls.push(currentWaveRolls);

        let explosionsInThisWave = 0;
        for (const die of currentWaveRolls) {
            totalSuccesses += calculateSuccesses(die, activeCharms);
            if (shouldDieExplode(die, activeCharms)) {
                explosionsInThisWave++;
            }
        }
        
        diceForNextWave = explosionsInThisWave;

        onProgress({
            diceHistories: allRolls,
            totalSuccesses,
            automaticSuccesses: 0,
            targetNumber,
            activeCharmNames: [],
            activeCharmIds: []
        });

        if (diceForNextWave > 0) {
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
        }
    }
    
    // --- Step 3: Final Calculation & Return ---
    let automaticSuccesses = 0;
    const activeCharmDetails = allCharms.flatMap(charm => {
        const charms = [];
        if (activeCharms.includes(charm.id)) charms.push(charm);
        if (charm.subEffects) {
            charm.subEffects.forEach(subCharm => {
                if (activeCharms.includes(subCharm.id)) charms.push(subCharm);
            });
        }
        return charms;
    });

    activeCharmDetails.forEach((charm) => {
        if (charm.effect.type === "add_successes") automaticSuccesses += charm.effect.value || 0;
        if (charm.effect.type === "add_successes_per_essence") automaticSuccesses += character.essence * (charm.effect.value || 0);
    });

    const finalTotalSuccesses = totalSuccesses + automaticSuccesses;

    const finalResult: DiceRoll = {
        diceHistories: allRolls,
        totalSuccesses: finalTotalSuccesses,
        automaticSuccesses,
        targetNumber: targetNumber,
        activeCharmNames: activeCharmDetails.filter(c => c.category === 'functional').map(c => c.name),
        activeCharmIds: activeCharms,
    };

    // Final progress update with all data
    onProgress(finalResult);

    return finalResult;
};
