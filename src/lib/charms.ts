import type { Charm } from "./types";

const toId = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

/**
 * @fileoverview This file is the single source of truth for all charm definitions.
 * It follows a "data-only" approach, containing no business logic.
 * Charms are organized by minimum Essence level for clarity and maintainability.
 */

// =================================================================
// ESSENCE 1 CHARMS
// =================================================================

const essence1Charms: Charm[] = [
  {
    id: toId("Flawless Handiwork Method"),
    name: "Flawless Handiwork Method",
    cost: "3m",
    description: "Craft rolls supplemented by this Charm reroll 10s until no more appear (dice explode).",
    minCraft: 1,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'functional',
  },
  {
    id: toId("Supreme Masterwork Focus"),
    name: "Supreme Masterwork Focus",
    description: "A multi-tiered charm that improves the quality of successes on crafting rolls and causes high-value dice to explode.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'functional',
    subEffects: [
      {
        id: toId("Supreme Masterwork Focus-1"),
        name: "Level 1: Double & Explode Nines",
        cost: "5m, 1wp",
        description: "Supplements (Attribute + Craft) rolls for basic/major projects with double 9s. Each 9 also explodes.",
        minCraft: 3,
        minEssence: 1,
        effect: { type: "double_success", value: 9 },
      },
      {
        id: toId("Supreme Masterwork Focus-2"),
        name: "Level 2: Double & Explode Eights",
        cost: "5m, 1wp, 1gxp",
        description: "Repurchase for double 8s on basic, major, or superior project rolls. Each 8 also explodes.",
        minCraft: 5,
        minEssence: 2,
        effect: { type: "double_success", value: 8 },
      },
      {
        id: toId("Supreme Masterwork Focus-3"),
        name: "Level 3: Double & Explode Sevens",
        cost: "2m, 1wxp",
        description: "A third repurchase grants double 7s on any (Attribute + Craft) roll. Each 7 also explodes.",
        minCraft: 5,
        minEssence: 3,
        effect: { type: "double_success", value: 7 },
      },
    ],
  },
  {
    id: toId("Unsurpassed Masterpiece Method"),
    name: "Unsurpassed Masterpiece Method",
    cost: "5m",
    description: "Add automatic successes to a Craft roll equal to character's Essence.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "add_successes_per_essence", value: 1 },
    category: 'functional',
  },
  {
    id: toId("Crack-Mending Technique"),
    name: "Crack-Mending Technique",
    cost: "5m",
    description: "Repairs extremely damaged objects. Can lower repair difficulty by 1 for fragmented Artifacts.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "lower_repair_difficulty", value: 1 },
    category: 'functional',
  },
  {
    id: toId("Tireless Workhorse Method"),
    name: "Tireless Workhorse Method",
    description: "Permanently grants two major project slots per dot of Essence the Solar possesses.",
    minCraft: 2,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Craftsman Needs No Tools"),
    name: "Craftsman Needs No Tools",
    cost: "5m",
    description: "Allows starting and completing basic/major projects rapidly without tools or workshop, shaping material directly.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Durability-Enhancing Technique"),
    name: "Durability-Enhancing Technique",
    cost: "5m",
    description: "Doubles the object’s health levels and resistance to damage. A classic for any serious artisan.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
];


// =================================================================
// ESSENCE 2 CHARMS
// =================================================================

const essence2Charms: Charm[] = [
  {
    id: toId("Experiential Conjuring of True Void"),
    name: "Experiential Conjuring of True Void",
    cost: "4m, 4xp", // XP cost is variable
    description: "Grants 1 automatic success and adds (Essence) dice, or (Intelligence + Essence) at E3+. Cannot be used on basic projects.",
    minCraft: 3,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'functional',
    subEffects: [
      {
        id: toId("First Movement of the Demiurge"),
        name: "Upgrade: First Movement of the Demiurge",
        description: "Permanent upgrade. For every three of a kind successes, convert a non-success die to a 10.",
        minCraft: 4,
        minEssence: 2,
        effect: { type: "custom" },
      }
    ]
  },
  {
    id: toId("Hundred-Hand Style"),
    name: "Hundred-Hand Style",
    cost: "10m, 1wp",
    description: "Allows the Solar to work on (Essence) basic or major projects at once for a single day.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Words-as-Workshop Method"),
    name: "Words-as-Workshop Method",
    cost: "10m",
    description: "The Solar can direct other craftsmen, their hands guided by her genius. Her (Attribute + Craft) roll can be used for a project even if she never touches it.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Sublime Transference"),
    name: "Sublime Transference",
    cost: "1m per 2 committed",
    description: "Allows the crafter to commit their own motes into an artifact's pool as it is being created, fulfilling Evocation-of-Need prerequisites.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
  },
];


// =================================================================
// ESSENCE 3 CHARMS
// =================================================================

const essence3Charms: Charm[] = [
  {
    id: toId("Will-Forging Discipline"),
    name: "Will-Forging Discipline",
    cost: "1wp per 2 succ.",
    description: "Spend Willpower to add automatic successes to a Craft roll. Each point of Willpower adds two successes.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "add_successes", value: 2 },
    category: 'functional',
  },
   {
    id: toId("Ever-Ready Innovation Discipline"),
    name: "Ever-Ready Innovation Discipline",
    cost: "15m, 1wp",
    description: "Retroactively complete a major project as a plot device. Prereq: Thousand-Forge Hands. Requires 15+ SXP on hand to activate (SXP is not spent). May be used (Essence/2) times per story. Clever use may grant bonus XP.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'narrative',
  },
];

// =================================================================
// ESSENCE 4 CHARMS
// =================================================================

const essence4Charms: Charm[] = [
  {
    id: toId("World-Defining Artifice"),
    name: "World-Defining Artifice",
    cost: "15m, 1wp",
    description: "Allows the creation of demesnes, manses, and other reality-shaping constructs outside the normal crafting rules.",
    minCraft: 5,
    minEssence: 4,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Soul-Stirring Handiwork"),
    name: "Soul-Stirring Handiwork",
    cost: "10m, 1wp",
    description: "The Solar can imbue her creations with powerful emotions, making them more persuasive, intimidating, or comforting.",
    minCraft: 5,
    minEssence: 4,
    effect: { type: "custom" },
    category: 'narrative',
  },
];

// =================================================================
// ESSENCE 5 CHARMS
// =================================================================

const essence5Charms: Charm[] = [
  {
    id: toId("Sovereign of the Forges"),
    name: "Sovereign of the Forges",
    cost: "—",
    description: "The Solar becomes a conceptual workshop, able to create anything anywhere, with her Essence providing the materials.",
    minCraft: 5,
    minEssence: 5,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Blade of the Unconquered Sun"),
    name: "Blade of the Unconquered Sun",
    cost: "10m, 1wp, 1wxp",
    description: "Allows the creation of artifacts specifically designed to permanently destroy the servants of the Yozis and the Neverborn.",
    minCraft: 5,
    minEssence: 5,
    effect: { type: "custom" },
    category: 'narrative',
  },
];


// =================================================================
// EXPORT ALL CHARMS
// =================================================================

export const allCharms: Charm[] = [
    ...essence1Charms,
    ...essence2Charms,
    ...essence3Charms,
    ...essence4Charms,
    ...essence5Charms,
];
