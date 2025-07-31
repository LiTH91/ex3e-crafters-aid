
export type Attribute = 
  | "intelligence"
  | "wits"
  | "perception"
  | "strength"
  | "dexterity"
  | "stamina"
  | "charisma"
  | "manipulation"
  | "appearance";

export type ProjectCategory = "mundane" | "superior" | "artifact";
export type ProjectType = 
  | "basic-project"
  | "major-project"
  | "superior-project"
  | "legendary-project"
  | "basic-repair"
  | "major-repair"
  | "superior-repair"
  | "legendary-repair";

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

export interface JournalEntry {
  id: string;
  projectName: string;
  date: string;
  notes?: string;
  category: ProjectCategory;
  outcome: CraftingOutcome;
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
  willpower: number;
  essence: number;
  selectedAttribute: Attribute; // This was missing
}

export interface Charm {
  id: string;
  name: string;
  ability: string;
  category: 'functional' | 'narrative';
  description: string;
  minCraft: number;
  minEssence: number;
  effect: any; // Simplified for now
  subEffects?: Charm[];
}

export interface DiceRoll {
  diceHistories: number[][];
  totalSuccesses: number;
  automaticSuccesses: number;
  targetNumber: number;
  activeCharmNames: string[];
  activeCharmIds: string[];
}

export interface CraftingOutcome {
  outcomeTitle: string;
  outcomeDescription: string;
  experienceGained: CraftingExperience;
  successes: number; // Duplicated for easier access, to be cleaned up
  time: string;
  resources: string;
  notes?: string;
}
