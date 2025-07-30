import type { EvaluateCraftingOutcomeOutput } from "@/ai/flows/evaluate-crafting-outcome";

export const ATTRIBUTES = [
  "intelligence",
  "wits",
  "perception",
  "strength",
  "dexterity",
  "stamina",
  "charisma",
  "manipulation",
  "appearance",
] as const;

export type Attribute = (typeof ATTRIBUTES)[number];

export const PROJECT_TYPES = [
  "basic-creation",
  "major-creation",
  "superior-creation",
  "legendary-creation",
  "basic-repair",
  "major-repair",
  "superior-repair",
  "legendary-repair",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface Project {
  type: ProjectType;
  artifactRating: number; // 0 for non-artifacts
  basicObjectives: number; // 0-3
}

export interface Character {
  intelligence: number;
  wits: number;
  perception: number;
  strength: number;
  dexterity: number;
  stamina: number;
  charisma: number;
  manipulation: number;
  appearance: number;
  craft: number;
  essence: number;
  selectedAttribute: Attribute;
  knownCharms: string[]; // Array of charm IDs
}

export interface CharmEffect {
  type: "add_successes" | "reroll_failures" | "custom";
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
