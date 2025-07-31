
import type { Character, DiceRoll, DieResult } from "./types";
import { allCharms } from "./charms";

const ANIMATION_DELAY = 100;

// --- Helper Functions ---

const rollDie = (): DieResult => ({ value: Math.floor(Math.random() * 10) + 1 });

const shouldDieExplode = (roll: number, activeCharms: string[]): boolean => {
  if (activeCharms.includes("flawless-handiwork-method") && roll === 10) return true;
  if (activeCharms.includes('supreme-masterwork-focus-3') && roll >= 7) return true;
  if (activeCharms.includes('supreme-masterwork-focus-2') && roll >= 8) return true;
  if (activeCharms.includes('supreme-masterwork-focus-1') && roll >= 9) return true;
  return false;
};

const getExplosionSource = (roll: number, activeCharms: string[]): string | undefined => {
    if (activeCharms.includes("flawless-handiwork-method") && roll === 10) return "Flawless Handiwork Method";
    if (activeCharms.includes('supreme-masterwork-focus-3') && roll >= 7) return "Supreme Masterwork Focus";
    if (activeCharms.includes('supreme-masterwork-focus-2') && roll >= 8) return "Supreme Masterwork Focus";
    if (activeCharms.includes('supreme-masterwork-focus-1') && roll >= 9) return "Supreme Masterwork Focus";
    return undefined;
}

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
  willpowerSpent: number;
  onProgress: (interimRoll: DiceRoll) => void;
}

export const performDiceRoll = async (input: DiceRollInput): Promise<DiceRoll> => {
    const { character, activeCharms, targetNumber, willpowerSpent, onProgress } = input;
    
    await new Promise(resolve => setTimeout(resolve, 50));

    let initialDicePool = character[character.selectedAttribute] + character.craft;
    let automaticSuccesses = 0;
    
    const isVoidConjuringActive = activeCharms.includes('experiential-conjuring-of-true-void');
    if (isVoidConjuringActive) {
        automaticSuccesses += 1;
        if (character.essence >= 3) {
            initialDicePool += character.intelligence + character.essence;
        } else {
            initialDicePool += character.essence;
        }
    }

    const allRolls: DieResult[][] = [];
    let totalSuccesses = 0;
    
    // --- Step 1: Initial Roll ---
    let firstWaveRolls: DieResult[] = Array.from({ length: initialDicePool }, rollDie);
    allRolls.push(firstWaveRolls);
    
    // Step 2: First Movement of the Demiurge (Success conversion)
    if (activeCharms.includes('first-movement-of-the-demiurge')) {
      const successCounts: { [key: number]: number } = {};
      firstWaveRolls.forEach(die => {
        const successes = calculateSuccesses(die.value, activeCharms);
        if (successes > 0) {
          successCounts[die.value] = (successCounts[die.value] || 0) + 1;
        }
      });
      
      let conversions = 0;
      Object.values(successCounts).forEach(count => {
        conversions += Math.floor(count / 3);
      });
      
      if (conversions > 0) {
        let nonSuccessDice = firstWaveRolls.filter(d => calculateSuccesses(d.value, activeCharms) === 0);
        
        const diceToConvert = Math.min(conversions, nonSuccessDice.length);
        for(let i = 0; i < diceToConvert; i++) {
          const dieToChange = nonSuccessDice[i];
          const originalIndex = firstWaveRolls.findIndex(d => d === dieToChange);
          firstWaveRolls[originalIndex] = { 
            value: 10, 
            initialValue: dieToChange.value, 
            modification: 'conversion',
            modificationSource: 'First Movement of the Demiurge'
          };
        }
      }
    }


    // --- Step 3: Calculate Successes and Explosions ---
    let diceToExplode: DieResult[] = [];
    for (const die of firstWaveRolls) {
        totalSuccesses += calculateSuccesses(die.value, activeCharms);
        if (shouldDieExplode(die.value, activeCharms)) {
            diceToExplode.push(die);
        }
    }

    onProgress({
        diceHistories: allRolls, totalSuccesses, automaticSuccesses, targetNumber, activeCharmNames: [], activeCharmIds: []
    });
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));


    // --- Step 4: Explosion Loop (Waves) ---
    let explosionsForNextWave = diceToExplode;

    while (explosionsForNextWave.length > 0) {
        const currentWaveRolls: DieResult[] = explosionsForNextWave.map(explodingDie => {
            const newDie = rollDie();
            return {
                ...newDie,
                initialValue: explodingDie.value,
                modification: 'explosion',
                modificationSource: getExplosionSource(explodingDie.value, activeCharms)
            }
        });

        allRolls.push(currentWaveRolls);
        explosionsForNextWave = [];

        for (const die of currentWaveRolls) {
            totalSuccesses += calculateSuccesses(die.value, activeCharms);
            if (shouldDieExplode(die.value, activeCharms)) {
                explosionsForNextWave.push(die);
            }
        }
        
        onProgress({
            diceHistories: allRolls, totalSuccesses, automaticSuccesses, targetNumber, activeCharmNames: [], activeCharmIds: []
        });

        if (explosionsForNextWave.length > 0) {
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
        }
    }
    
    // --- Step 5: Final Calculation & Return ---
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
        if (charm.id === 'will-forging-discipline') {
            automaticSuccesses += willpowerSpent * 2;
        }
        else if (charm.id !== 'experiential-conjuring-of-true-void' && charm.effect.type === "add_successes") {
            automaticSuccesses += charm.effect.value || 0;
        }
        else if (charm.effect.type === "add_successes_per_essence") {
            automaticSuccesses += character.essence * (charm.effect.value || 0);
        }
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
