
import type { Character, DiceRoll } from "./types";
import { allCharms } from "./charms";

const ANIMATION_DELAY = 100;

// --- Helper Functions ---

const rollDie = () => Math.floor(Math.random() * 10) + 1;

const shouldDieExplode = (roll: number, activeCharms: string[]): boolean => {
  if (activeCharms.includes("flawless-handiwork-method") && roll === 10) return true;
  if (activeCharms.includes('supreme-masterwork-focus-1') && roll === 9) return true;
  if (activeCharms.includes('supreme-masterwork-focus-2') && roll === 8) return true;
  if (activeCharms.includes('supreme-masterwork-focus-3') && roll === 7) return true;
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

    let diceToRoll = character[character.selectedAttribute] + character.craft;
    const allRolls: number[][] = [];
    let totalSuccesses = 0;

    // --- Special Case: Reroll Failures (First Movement of the Demiurge) ---
    const willRerollFailures = activeCharms.includes("first-movement-of-the-demiurge");
    if (willRerollFailures) {
        let initialDice = Array.from({ length: diceToRoll }, rollDie);
        // We show the first roll, then the rerolled one
        allRolls.push([...initialDice]);
        onProgress({
            diceHistories: allRolls, totalSuccesses: 0, automaticSuccesses: 0, targetNumber, activeCharmNames: [],
        });
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY + 200));

        initialDice = initialDice.map(die => (die < 7 ? rollDie() : die));
        allRolls[0] = initialDice; // Replace the first wave with the rerolled dice

        // From this point, the main loop will handle successes and explosions for this modified first wave.
    }
    
    // --- Main Explosion Loop (Wave-based approach) ---
    let currentWaveDice = diceToRoll;
    
    while (currentWaveDice > 0) {
        const currentWaveRolls = Array.from({ length: currentWaveDice }, rollDie);
        
        // If we already rerolled, we replace the placeholder. Otherwise, we add a new wave.
        if (willRerollFailures && allRolls.length === 1) {
            // This condition is a bit complex: it ensures that we use the already-rerolled dice
            // for the first wave's calculation, instead of rolling them again.
            // We've already replaced allRolls[0] with the rerolled dice.
        } else {
             allRolls.push(currentWaveRolls);
        }

        let explosionsInWave = 0;
        
        // Use the most recent wave for calculations
        const waveToCalculate = allRolls[allRolls.length - 1];
        
        for (const die of waveToCalculate) {
            totalSuccesses += calculateSuccesses(die, activeCharms);
            if (shouldDieExplode(die, activeCharms)) {
                explosionsInWave++;
            }
        }
        
        currentWaveDice = explosionsInWave;

        onProgress({
            diceHistories: allRolls,
            totalSuccesses,
            automaticSuccesses: 0, // This will be populated at the end
            targetNumber,
            activeCharmNames: [], // This will be populated at the end
        });

        if (currentWaveDice > 0) {
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
        }
    }
    
    // --- Final Calculation ---
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
    });

    const finalTotalSuccesses = totalSuccesses + automaticSuccesses;

    // Final progress update with all data
    onProgress({
        diceHistories: allRolls,
        totalSuccesses: finalTotalSuccesses,
        automaticSuccesses,
        targetNumber,
        activeCharmNames: activeCharmDetails.map(c => c.name)
    });

    return {
        diceHistories: allRolls,
        totalSuccesses: finalTotalSuccesses,
        automaticSuccesses,
        targetNumber: targetNumber,
        activeCharmNames: activeCharmDetails.map(c => c.name)
    };
};
