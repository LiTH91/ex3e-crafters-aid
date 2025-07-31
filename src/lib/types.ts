
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

// This represents an active, ongoing project.
export interface ActiveProject {
  id: string;
  name: string;
  category: ProjectCategory;
  goal: number;
  progress: number;
  isComplete: boolean;
}

// This represents the accumulated experience points.
export interface CraftingExperience {
  sxp: number;
  gxp: number;
  wxp: number;
}

// This represents a finished project stored in the journal.
// It combines details from the project with the outcome.
export interface JournalEntry {
  id: string;
  projectName: string;
  date: string;
  notes?: string;
  category: ProjectCategory;
  outcome: CraftingOutcome; // Include the outcome for detailed view
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
  specialty: number;
  // ... other abilities can be added here as needed
}

export interface Charm {
  name: string;
  ability: string;
  type: string;
  minEssence: number;
}


export interface DiceRoll {
  rolledDice: number[];
  successes: number;
  botches: number;
}

// This represents the calculated outcome of a crafting roll.
export interface CraftingOutcome {
  successes: number;
  time: string;
  resources: string;
  notes?: string;
}
