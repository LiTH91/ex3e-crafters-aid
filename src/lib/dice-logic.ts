
import type { Character, DiceRoll } from "./types";
import { allCharms } from "./charms";

const ANIMATION_DELAY = 50;

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
  // Note: The SMF charms grant double successes on their respective numbers,
  // AND cause them to explode. The base rule is 1 success on 7-9. So doubling them means they are worth 2.
  if (smf3 && roll >= 7) return 2; // If you have level 3, 7s, 8s, 9s, 10s are all worth 2 successes.
  if (smf2 && roll >= 8) return 2; // If you have level 2, 8s and 9s are worth 2.
  if (smf1 && roll >= 9) return 2; // If you have level 1, only 9s are worth 2.
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

    // --- 1. Initial Roll ---
    const dicePool = character[character.selectedAttribute] + character.craft;
    const initialRolls = Array.from({ length: dicePool }, rollDie);
    let diceHistories: number[][] = initialRolls.map(r => [r]);

    onProgress({
        diceHistories: diceHistories.map(h => [...h]),
        totalSuccesses: 0,
        automaticSuccesses: 0,
        targetNumber: targetNumber,
        activeCharmNames: [],
    });
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));


    // --- 2. Handle Explosions in "Rows" ---
    let processedExplosionIndices = new Set<string>();

    while (true) {
        let explosionsInThisPass = 0;
        
        for (let i = 0; i < diceHistories.length; i++) {
            const history = diceHistories[i];
            const lastRoll = history[history.length - 1];
            // A unique key for each die roll *position*. 
            // e.g., "die 0, roll 0", "die 0, roll 1", etc.
            const historyKey = `${i}-${history.length - 1}`; 

            if (shouldDieExplode(lastRoll, activeCharms) && !processedExplosionIndices.has(historyKey)) {
                history.push(rollDie());
                explosionsInThisPass++;
                processedExplosionIndices.add(historyKey); // Mark this position as having been processed for explosion
            }
        }

        if (explosionsInThisPass > 0) {
            onProgress({
                diceHistories: diceHistories.map(h => [...h]),
                totalSuccesses: 0, // Don't calculate successes until the end
                automaticSuccesses: 0,
                targetNumber: targetNumber,
                activeCharmNames: [],
            });
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY * 2));
        } else {
            break; // No new explosions in a full pass, so we're done.
        }
    }

    // --- Handle Reroll Failures ---
    const willRerollFailures = activeCharms.includes("first-movement-of-the-demiurge");
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
           onProgress({
                diceHistories: diceHistories.map(h => [...h]),
                totalSuccesses: 0,
                automaticSuccesses: 0,
                targetNumber: targetNumber,
                activeCharmNames: [],
           });
           await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
        }
    }

    // --- 3. Final Calculation ---
    const baseSuccesses = diceHistories.reduce((total, history) => {
        const finalRoll = history[history.length - 1];
        return total + calculateSuccesses(finalRoll, activeCharms);
    }, 0);

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

    const totalSuccesses = baseSuccesses + automaticSuccesses;

    return {
        diceHistories,
        totalSuccesses,
        automaticSuccesses,
        targetNumber: targetNumber,
        activeCharmNames: activeCharmDetails.map(c => c.name)
    };
};
