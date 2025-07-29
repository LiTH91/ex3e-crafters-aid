import type { EvaluateCraftingOutcomeOutput } from "@/ai/flows/evaluate-crafting-outcome";

export interface Character {
  intelligence: number;
  craft: number;
  knownCharms: string[]; // Array of charm IDs
}

export interface CharmEffect {
  type: 'add_successes' | 'reroll_failures' | 'custom';
  value: number;
}

export interface Charm {
  id: string;
  name: string;
  description: string;
  minCraft: number;
  minEssence: number;
  effect: CharmEffect;
}

export interface DiceRoll {
  initialRolls: number[];
  finalRolls: number[];
  rerolledIndices: number[];
  totalSuccesses: number;
  automaticSuccesses: number;
}

export type AiOutcome = EvaluateCraftingOutcomeOutput;
