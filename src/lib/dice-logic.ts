
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

    // --- Reroll Failures (First Movement of the Demiurge) ---
    // This charm is a special case. It's a single, full reroll of failures,
    // which happens *before* calculating successes or explosions on the initial roll.
    const willRerollFailures = activeCharms.includes("first-movement-of-the-demiurge");
    if (willRerollFailures) {
        const initialDice = Array.from({ length: diceToRoll }, rollDie);
        const rerolledDice = initialDice.map(die => (die < 7 ? rollDie() : die));
        allRolls.push(rerolledDice);
        diceToRoll = 0; // The base pool has been rolled.
    }
    
    // --- Main Explosion Loop ---
    while (diceToRoll > 0) {
        const currentWave = Array.from({ length: diceToRoll }, rollDie);
        allRolls.push(currentWave);
        
        let explosionsInWave = 0;
        
        for (const die of currentWave) {
            totalSuccesses += calculateSuccesses(die, activeCharms);
            if (shouldDieExplode(die, activeCharms)) {
                explosionsInWave++;
            }
        }
        
        diceToRoll = explosionsInWave;

        onProgress({
            diceHistories: allRolls,
            totalSuccesses,
            automaticSuccesses: 0,
            targetNumber,
            activeCharmNames: [], // This will be populated at the end
        });

        if (diceToRoll > 0) {
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

    return {
        diceHistories: allRolls,
        totalSuccesses: finalTotalSuccesses,
        automaticSuccesses,
        targetNumber: targetNumber,
        activeCharmNames: activeCharmDetails.map(c => c.name)
    };
};
