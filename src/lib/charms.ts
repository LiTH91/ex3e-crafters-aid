import type { Charm } from "./types";

const toId = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const allCharms: Charm[] = [
  // Essence 1
  {
    id: toId("Flawless Handiwork Method"),
    name: "Flawless Handiwork Method",
    cost: "3m",
    description: "Craft rolls supplemented by this Charm reroll 10s until no more appear (dice explode).",
    minCraft: 1,
    minEssence: 1,
    effect: { type: "custom" }, 
  },
  {
    id: toId("Unsurpassed Masterpiece Method"),
    name: "Unsurpassed Masterpiece Method",
    cost: "5m",
    description: "Add automatic successes to a Craft roll equal to character's Essence.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "add_successes_per_essence", value: 1 },
  },
  {
    id: toId("Tireless Workhorse Method"),
    name: "Tireless Workhorse Method",
    description: "Permanently grants two major project slots per dot of Essence the Solar possesses.",
    minCraft: 2,
    minEssence: 1,
    effect: { type: "custom" },
  },
  {
    id: toId("Craftsman Needs No Tools"),
    name: "Craftsman Needs No Tools",
    cost: "5m",
    description: "Allows starting and completing basic/major projects rapidly without tools or workshop, shaping material directly. Reduces cost by 2 motes if tools are used. Does not significantly speed superior/legendary projects.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
  },
   {
    id: toId("Supreme Masterwork Focus"),
    name: "Supreme Masterwork Focus",
    description: "A multi-tiered charm that improves the quality of successes on crafting rolls and causes high-value dice to explode.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
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
      }
    ]
  },
  {
    id: toId("Crack-Mending Technique"),
    name: "Crack-Mending Technique",
    cost: "5m",
    description: "Repairs extremely damaged objects. Can lower repair difficulty by 1 for fragmented Artifacts.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "lower_repair_difficulty", value: 1 },
  },
  
  // Essence 2
  {
    id: toId("First Movement of the Demiurge"),
    name: "First Movement of the Demiurge",
    cost: "5m",
    description: "Reroll all failed dice (1-6) on a Craft roll.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "reroll_failures" },
  },
  {
    id: toId("Hundred-Hand Style"),
    name: "Hundred-Hand Style",
    cost: "10m, 1wp",
    description: "Allows the Solar to work on (Essence) basic or major projects at once for a single day.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "custom" },
  },
  {
    id: toId("Words-as-Workshop Method"),
    name: "Words-as-Workshop Method",
    cost: "10m",
    description: "The Solar can direct other craftsmen, their hands guided by her genius. Her (Attribute + Craft) roll can be used for a project even if she never touches it.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "custom" },
  },
];
