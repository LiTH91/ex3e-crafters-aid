
import type { Character, DiceRoll, DieResult } from "./types";
import { allCharms } from "./charms";

const ANIMATION_DELAY = 100;

// --- Helper Functions ---

const rollDie = (): DieResult => ({ value: Math.floor(Math.random() * 10) + 1 });

const getExplosionSource = (roll: number, activeCharms: string[]): string | undefined => {
    if (activeCharms.includes("flawless-handiwork-method") && roll === 10) return "Flawless Handiwork Method";
    if (activeCharms.includes('supreme-masterwork-focus-3') && roll >= 7) return "Supreme Masterwork Focus";
    if (activeCharms.includes('supreme-masterwork-focus-2') && roll >= 8) return "Supreme Masterwork Focus";
    if (activeCharms.includes('supreme-masterwork-focus-1') && roll >= 9) return "Supreme Masterwork Focus";
    return undefined;
}

export const shouldDieExplode = (die: DieResult, activeCharms: string[]): boolean => {
  // A die that has already been modified in this chain should not cause another event.
  if (die.isModified) return false;

  const roll = die.value;
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
  if (smf3 && roll >= 7) return 2; 
  if (smf2 && roll >= 8) return 2;
  if (smf1 && roll >= 9) return 2;
  if (roll >= 7) return 1;
  return 0;
};

const calculateSuccessesFromWave = (wave: DieResult[], activeCharms: string[]): number => {
    return wave.reduce((sum, die) => sum + calculateSuccesses(die.value, activeCharms), 0);
}


// --- Main Logic Function ---

interface DiceRollInput {
  character: Character;
  activeCharms: string[];
  targetNumber: number;
  willpowerSpent: number;
  excellencyDice: number;
  onProgress: (interimRoll: DiceRoll) => void;
}

export const performDiceRoll = async (input: DiceRollInput): Promise<DiceRoll> => {
    const { character, activeCharms, targetNumber, willpowerSpent, excellencyDice, onProgress } = input;
    
    await new Promise(resolve => setTimeout(resolve, 50));

    let initialDicePool = character[character.selectedAttribute] + character.craft + excellencyDice;
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

    const diceHistories: DieResult[][] = [];
    
    // Initial Roll
    let currentWave = Array.from({ length: initialDicePool }, rollDie);
    diceHistories.push(currentWave);
    
    const isFMDActive = activeCharms.includes('first-movement-of-the-demiurge');
    let fmdConversionCounter = 0;

    // --- Iterative Loop for FMD and Explosions ---
    let keepLooping = true;
    while(keepLooping) {
        
        onProgress({ diceHistories, totalSuccesses: 0, automaticSuccesses, targetNumber, activeCharmNames: [], activeCharmIds: activeCharms, excellencyDice, sxpFromCharm: 0, bonusDiceFromCharm: 0 });
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));

        const nextWave: DieResult[] = [];
        
        // Step 1: FMD - Three-of-a-kind conversions
        if (isFMDActive) {
            const allDiceForFMDCheck = diceHistories.flat();
            const successDiceInPlay = allDiceForFMDCheck.filter(d => calculateSuccesses(d.value, activeCharms) > 0 && !d.usedForFMD);
            const successCounts: { [key: number]: DieResult[] } = {};
            
            successDiceInPlay.forEach(d => {
                if(!successCounts[d.value]) successCounts[d.value] = [];
                successCounts[d.value].push(d);
            });

            for (const value in successCounts) {
                 const diceGroup = successCounts[value];
                 const numTriggers = Math.floor(diceGroup.length / 3);

                 if (numTriggers > 0) {
                     const diceToMarkUsed = diceGroup.slice(0, numTriggers * 3);
                     diceToMarkUsed.forEach(d => d.usedForFMD = true);
                     
                     const nonSuccessDiceToConvert = allDiceForFMDCheck
                        .filter(d => calculateSuccesses(d.value, activeCharms) === 0 && !d.modification)
                        .slice(0, numTriggers);

                     for (const dieToChange of nonSuccessDiceToConvert) {
                         fmdConversionCounter++;
                         dieToChange.modification = 'fmd_source';
                         dieToChange.modificationSource = 'First Movement of the Demiurge';
                         dieToChange.fmdId = fmdConversionCounter;

                         const newDie: DieResult = {
                             value: 10,
                             initialValue: dieToChange.value,
                             modification: 'conversion',
                             modificationSource: 'First Movement of the Demiurge',
                             fmdId: fmdConversionCounter,
                         };
                         nextWave.push(newDie);
                     }
                 }
            }
        }
        
        // Step 2: Explosions from the most recent wave
        const explodingDice = currentWave.filter(d => shouldDieExplode(d, activeCharms));
        
        for(const explodingDie of explodingDice) {
            explodingDie.isModified = true; // Mark it as processed for this chain
            
            const newDie = rollDie();
            newDie.initialValue = explodingDie.value;
            newDie.modification = 'explosion';
            newDie.modificationSource = getExplosionSource(explodingDie.value, activeCharms);
            nextWave.push(newDie);
        }

        if(nextWave.length > 0) {
            diceHistories.push(nextWave);
            currentWave = nextWave;
        } else {
            keepLooping = false;
        }
    }

    // --- Divine Inspiration Technique & Holistic Miracle Understanding ---
    const isDivineInspirationActive = activeCharms.includes('divine-inspiration-technique');
    const isHolisticMiracleActive = activeCharms.includes('holistic-miracle-understanding');
    let bonusDiceFromCharm = 0;
    if (isDivineInspirationActive) {
        let keepGenerating = true;
        let additionalDiceFromHolistic = 0;

        while(keepGenerating) {
            const allDiceInPool = diceHistories.flat().filter(d => d.modification !== 'fmd_source');
            let currentTotalSuccesses = 0;
            allDiceInPool.forEach(die => {
                currentTotalSuccesses += calculateSuccesses(die.value, activeCharms);
            });
            currentTotalSuccesses += automaticSuccesses;

            let diceToGenerate = Math.floor(currentTotalSuccesses / 3) - bonusDiceFromCharm;
            diceToGenerate += additionalDiceFromHolistic;
            additionalDiceFromHolistic = 0; // Reset for next iteration

            if (diceToGenerate > 0) {
                bonusDiceFromCharm += diceToGenerate;
                const newWave = Array.from({ length: diceToGenerate }, rollDie);
                newWave.forEach(d => d.modificationSource = "Divine Inspiration Technique");
                
                diceHistories.push(newWave);
                onProgress({ diceHistories, totalSuccesses: 0, automaticSuccesses, targetNumber, activeCharmNames: [], activeCharmIds: activeCharms, excellencyDice, sxpFromCharm: 0, bonusDiceFromCharm });
                await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));

                // Check for Holistic Miracle Understanding
                if (isHolisticMiracleActive) {
                    const successesFromNewWave = calculateSuccessesFromWave(newWave, activeCharms);
                    if (successesFromNewWave >= 3) {
                        additionalDiceFromHolistic += 3;
                    }
                }

            } else {
                keepGenerating = false;
            }
        }
    }

    // --- Final Calculation & Return ---
    const finalDicePool = diceHistories.flat();
    let totalSuccesses = 0;
    
    // Only count successes from dice that weren't the source for FMD
    finalDicePool.filter(d => d.modification !== 'fmd_source').forEach(die => {
        totalSuccesses += calculateSuccesses(die.value, activeCharms);
    });

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

    let sxpFromCharm = 0;
    if (activeCharms.includes('brass-scales-falling') && excellencyDice === 0) {
        const tensRolled = finalDicePool.filter(d => d.value === 10).length;
        const sxpCap = character.essence * 2; // Assuming base charm, not repurchased
        sxpFromCharm = Math.min(tensRolled, sxpCap);
    }


    const finalTotalSuccesses = totalSuccesses + automaticSuccesses;

    const finalResult: DiceRoll = {
        diceHistories: diceHistories,
        totalSuccesses: finalTotalSuccesses,
        automaticSuccesses,
        targetNumber: targetNumber,
        activeCharmNames: activeCharmDetails.filter(c => c.category === 'functional').map(c => c.name),
        activeCharmIds: activeCharms,
        excellencyDice,
        sxpFromCharm,
        bonusDiceFromCharm,
    };

    // Final progress update with all data
    onProgress(finalResult);

    return finalResult;
};
