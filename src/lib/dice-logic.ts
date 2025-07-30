
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

    // --- 1. Initial Roll ---
    const dicePool = character[character.selectedAttribute] + character.craft;
    const initialRolls = Array.from({ length: dicePool }, rollDie);
    let diceHistories: number[][] = initialRolls.map(r => [r]);

    // --- 2. Handle Explosions & Rerolls ---
    while (true) {
        let explosionsInThisPass = 0;
        
        for (const history of diceHistories) {
            // Check only the last die in a chain that hasn't been processed yet for explosion
            if (history.length > 0) {
                const lastRoll = history[history.length - 1];
                if (shouldDieExplode(lastRoll, activeCharms)) {
                    // Check if this is the first time this specific die is exploding to avoid infinite loops on the same die
                    if (!history.includes(-1)) { // Use a marker to indicate it has exploded once
                        history.push(rollDie());
                        explosionsInThisPass++;
                    }
                }
            }
        }
        
        // This marks all dice that exploded in the pass so they don't re-explode infinitely.
        // A better way would be to track indices, but for now, we'll reset this check marker
        diceHistories.forEach(h => {
             const markerIndex = h.indexOf(-1);
             if (markerIndex > -1) h.splice(markerIndex, 1);
             if(shouldDieExplode(h[h.length - 2], activeCharms)) h.splice(h.length-1, 0, -1);
        });

        if (explosionsInThisPass > 0) {
            const tempSuccesses = diceHistories.reduce((total, history) => total + calculateSuccesses(history[history.length - 1], activeCharms), 0);
            onProgress({
                diceHistories: diceHistories.map(h => [...h.filter(n => n > 0)]),
                totalSuccesses: tempSuccesses,
                automaticSuccesses: 0,
                targetNumber: targetNumber,
                activeCharmNames: [], // We'll fill this at the end
            });
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY * 2));
        } else {
            break;
        }
    }
    
    // Clean up any markers
    diceHistories = diceHistories.map(h => h.filter(n => n > 0));


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
    const activeCharmDetails = allCharms.filter(charm => activeCharms.includes(charm.id));
    activeCharmDetails.forEach((charm) => {
        if (charm.effect.type === "add_successes") automaticSuccesses += charm.effect.value;
    });

    const totalSuccesses = baseSuccesses + automaticSuccesses;

    return {
        diceHistories,
        totalSuccesses,
        automaticSuccesses,
        targetNumber: targetNumber,
        activeCharmNames: allCharms
            .filter(c => activeCharms.includes(c.id) || c.subEffects?.some(s => activeCharms.includes(s.id)))
            .flatMap(c => {
                const names = [];
                if (activeCharms.includes(c.id) && c.id !== 'supreme-masterwork-focus') names.push(c.name);
                c.subEffects?.forEach(s => {
                    if (activeCharms.includes(s.id)) names.push(s.name);
                })
                return names;
            })
    };
};
