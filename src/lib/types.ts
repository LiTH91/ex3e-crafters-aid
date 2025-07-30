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
    "basic-project",
    "major-project",
    "superior-project",
    "legendary-project",
    "basic-repair",
    "major-repair",
    "superior-repair",
    "legendary-repair",
  ] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface Project {
  type: ProjectType;
  artifactRating: number; // 0 for non-artifacts
  objectivesMet: number;
}

export interface ActiveProject {
  id: string;
  name: string;
  type: ProjectType;
  goal: number;
  progress: number;
  isComplete: boolean;
}

export interface CraftingExperience {
  sxp: number;
  gxp: number;
  wxp: number;
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
  personalMotes: number;
  peripheralMotes: number;
  willpower: number;
  selectedAttribute: Attribute;
  knownCharms: string[]; // Array of charm IDs
}

export interface CharmEffect {
  type:
    | "add_successes"
    | "reroll_failures"
    | "reroll_tens"
    | "double_success"
    | "lower_repair_difficulty"
    | "custom";
  value?: number;
}

export interface Charm {
  id: string;
  name:string;
  cost?: string;
  description: string;
  minCraft: number;
  minEssence: number;
  effect: CharmEffect;
  subEffects?: Charm[];
}

export interface DiceRoll {
  initialRolls: number[];
  finalRolls: number[];
  rerolledIndices: number[];
  totalSuccesses: number;
  automaticSuccesses: number;
  targetNumber: number;
}

export interface CraftingOutcome {
  isSuccess: boolean;
  outcomeTitle: string;
  outcomeDescription: string;
  experienceGained: {
    sxp: number;
    gxp: number;
    wxp: number;
  };
}

    