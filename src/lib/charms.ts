import type { Charm } from "./types";

const toId = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const allCharms: Charm[] = [
  // Essence 1
  {
    id: toId("Flawless Handiwork Method"),
    name: "Flawless Handiwork Method",
    cost: "3m",
    description: "Craft rolls supplemented by this Charm reroll 10s until no more appear.",
    minCraft: 1,
    minEssence: 1,
    effect: { type: "reroll_tens" },
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
    description: "A multi-tiered charm that improves the quality of successes on crafting rolls.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
    subEffects: [
       {
        id: toId("Supreme Masterwork Focus-1"),
        name: "Level 1: Double Nines",
        cost: "5m, 1wp",
        description: "Supplements (Attribute + Craft) rolls for basic/major projects with double 9s.",
        minCraft: 3,
        minEssence: 1,
        effect: { type: "double_success", value: 9 },
      },
      {
        id: toId("Supreme Masterwork Focus-2"),
        name: "Level 2: Double Eights",
        cost: "5m, 1wp, 1gxp",
        description: "Repurchase for double 8s on basic, major, or superior project rolls.",
        minCraft: 5,
        minEssence: 2,
        effect: { type: "double_success", value: 8 },
      },
      {
        id: toId("Supreme Masterwork Focus-3"),
        name: "Level 3: Double Sevens",
        cost: "2m, 1wxp",
        description: "A third repurchase grants double 7s on any (Attribute + Craft) roll.",
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
  
];
