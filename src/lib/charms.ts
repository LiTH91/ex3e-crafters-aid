
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
    id: toId("Tireless Workhorse Method"),
    name: "Tireless Workhorse Method",
    description: "Permanently grants two major project slots per dot of Essence the Solar possesses.",
    minCraft: 2,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Efficient Craftsman Technique"),
    name: "Efficient Craftsman Technique",
    cost: "—",
    description: "This Charm permanently reduces the cost of temporary major slots to three silver points.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Arete-Shifting Prana"),
    name: "Arete-Shifting Prana",
    cost: "4m, 1sxp, 1wp",
    description: "Roll (Intelligence + Craft). For each success, convert a dot from one known Craft into a related one for a single project.",
    minCraft: 4,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Brass Scales Falling"),
    name: "Brass Scales Falling",
    cost: "—",
    description: "For each 10 on a Craft roll made without using the Craft Excellency, the Exalt earns a silver point, to a limit of (Essence * 2) points. Disables Excellency.",
    minCraft: 3,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'functional',
  },
  {
    id: toId("Red Anvils Ringing"),
    name: "Red Anvils Ringing",
    cost: "—",
    description: "Increases the amount of silver points gained from each basic objective by one.",
    minCraft: 4,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'functional',
  },
   {
    id: toId("Chains Fall Away"),
    name: "Chains Fall Away",
    cost: "—",
    description: "Each time the Solar achieves all three basic objectives on any Craft project, she gains one gold point.",
    minCraft: 5,
    minEssence: 1,
    effect: { type: "custom" },
    category: 'narrative',
  },
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
    id: toId("Triumph-Forging Eye"),
    name: "Triumph-Forging Eye",
    cost: "—",
    description: "Once per week, the Exalt may apply a free full Craft Excellency to any one roll.",
    minCraft: 2,
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
        name: "FMD: First Movement of the Demiurge",
        description: "Permanent upgrade. For every three of a kind successes, convert a non-success die to a 10.",
        minCraft: 4,
        minEssence: 2,
        effect: { type: "custom" },
      }
    ]
  },
  {
    id: toId("Thousand-Forge Hands"),
    name: "Thousand-Forge Hands",
    cost: "10m, 1wp",
    description: "Allows the Solar to complete a full day's work on a basic or major project without need for rest, finishing a work interval.",
    minCraft: 4,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
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
    id: toId("Supreme Celestial Focus"),
    name: "Supreme Celestial Focus",
    cost: "—",
    description: "This Charm allows the Exalt to raise an additional Craft rating from one to five by paying gold points instead of experience. The Exalt may raise up to (Essence) additional Craft ratings in this fashion, but each one after the first costs double the amount of gold points.",
    minCraft: 5,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Sublime Transference"),
    name: "Sublime Transference",
    cost: "6m",
    description: "Allows rearranging crafting points: 2 SXP to 1 GXP, 2 GXP to 1 WXP, and vice-versa. Each conversion direction requires a separate activation.",
    minCraft: 5,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Ages-Echoing Wisdom"),
    name: "Ages-Echoing Wisdom",
    cost: "—",
    description: "Gain a number of gold points equal to your permanent major project slots. This bonus recurs at the end of each story.",
    minCraft: 5,
    minEssence: 2,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Dragon Soul Emergence"),
    name: "Dragon Soul Emergence",
    cost: "—",
    description: "Grants one permanent superior project slot. This Charm may be purchased up to (Essence) times.",
    minCraft: 5,
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
  {
    id: toId("Copper Spider Conception"),
    name: "Copper Spider Conception",
    cost: "5m, 1wp",
    description: "Lowers the cost of creating a superior slot by two gold points and two major slots, to a minimum of one major slot and one gold point.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Clay and Breath Practice"),
    name: "Clay and Breath Practice",
    cost: "—",
    description: "On a superior roll with successes exceeding the finishing price, earn silver points equal to (Artifact Rating + Essence).",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Spirit-Gathering Industry"),
    name: "Spirit-Gathering Industry",
    cost: "—",
    description: "Permanently reduces the cost to finish a superior project by (Essence) gold points, to a minimum of three.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Summit-Piercing Touch"),
    name: "Summit-Piercing Touch",
    cost: "10m, 1wp",
    description: "Allows crafting a two-dot Artifact (or three-dot at Essence 5+) in a major project slot.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Vice-Miracle Technique"),
    name: "Vice-Miracle Technique",
    cost: "—",
    description: "Once per season, produce a finished two-dot Artifact (or three-dot at Essence 5+) for free, earning bonus GXP for clever narrative use.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Divine Inspiration Technique"),
    name: "Divine Inspiration Technique",
    cost: "—",
    description: "For every 3 successes on a Craft roll, gain an additional non-Charm die. This effect is recursive.",
    minCraft: 5,
    minEssence: 3,
    effect: { type: "custom" },
    category: 'functional',
  },
];

// =================================================================
// ESSENCE 4 CHARMS
// =================================================================

const essence4Charms: Charm[] = [
  {
    id: toId("Holistic Miracle Understanding"),
    name: "Holistic Miracle Understanding",
    cost: "—",
    description: "Enhances Divine Inspiration Technique. If a wave of generated non-Charm dice yields 3+ successes, add 3 more dice to the next wave.",
    minCraft: 5,
    minEssence: 4,
    effect: { type: "custom" },
    category: 'functional',
  },
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
    id: toId("Unwinding Gyre Meditation"),
    name: "Unwinding Gyre Meditation",
    cost: "10m, 1wp",
    description: "After a successful superior project, void the GXP bonus to reduce the goal number of the next project of the same rating and enhance its GXP bonus multiplier.",
    minCraft: 5,
    minEssence: 4,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("God-Forge Within"),
    name: "God-Forge Within",
    cost: "—",
    description: "Each purchase grants the Exalt two permanent legendary project slots. Can be purchased (Essence) times.",
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
    id: toId("Exegesis of the Distilled Form"),
    name: "Exegesis of the Distilled Form",
    cost: "25sxp, 15gxp, 10wxp+",
    description: "After completing five legendary projects, expend vast creative energy to convert remaining WXP into general experience points, once per story.",
    minCraft: 5,
    minEssence: 5,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Sun-Heart Tenacity"),
    name: "Sun-Heart Tenacity",
    cost: "—",
    description: "Each time a legendary project is completed, gain 10 automatic non-Charm successes for the next superior or legendary project she attempts to finish.",
    minCraft: 5,
    minEssence: 5,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Wonder-Forging Genius"),
    name: "Wonder-Forging Genius",
    cost: "—",
    description: "Once per story, when you have ten or more legendary projects, she may use this Charm to complete one of them without further rolls or expenditures of craft points.",
    minCraft: 5,
    minEssence: 5,
    effect: { type: "custom" },
    category: 'narrative',
  },
  {
    id: toId("Dual Magnus Prana"),
    name: "Dual Magnus Prana",
    cost: "30wxp",
    description: "Retroactively reveal that a seemingly slain character was a perfect simulacrum, allowing the real Solar to be located elsewhere. A sorcerous escape from death.",
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
