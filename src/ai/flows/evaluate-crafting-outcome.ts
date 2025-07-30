'use server';
/**
 * @fileOverview Evaluates the outcome of a crafting check using generative AI.
 *
 * - evaluateCraftingOutcome - A function that evaluates the crafting outcome.
 * - EvaluateCraftingOutcomeInput - The input type for the evaluateCraftingOutcome function.
 * - EvaluateCraftingOutcomeOutput - The return type for the evaluateCraftingOutcome function.
 */
import { ai } from "@/ai/genkit";
import { z } from "zod";
import type { ProjectType } from "@/lib/types";

export type EvaluateCraftingOutcomeInput = z.infer<
  typeof EvaluateCraftingOutcomeInputSchema
>;
const EvaluateCraftingOutcomeInputSchema = z.object({
  project: z.object({
    type: z.custom<ProjectType>(),
    artifactRating: z.number(),
    objectivesMet: z.number(),
  }),
  successes: z.number(),
  targetNumber: z.number(),
  charmEffects: z.string().optional(),
  isExceptional: z.boolean(),
  intervalsRemaining: z.number().optional(),
  legendaryBonusRoll: z.array(z.number()).optional(),
});

export type EvaluateCraftingOutcomeOutput = z.infer<
  typeof EvaluateCraftingOutcomeOutputSchema
>;
const EvaluateCraftingOutcomeOutputSchema = z.object({
  isSuccess: z.boolean(),
  outcomeTitle: z.string(),
  outcomeDescription: z.string(),
  experienceGained: z.object({
    sxp: z.number(),
    gxp: z.number(),
    wxp: z.number(),
  }),
});


export async function evaluateCraftingOutcome(
  input: EvaluateCraftingOutcomeInput,
): Promise<EvaluateCraftingOutcomeOutput> {
  return evaluateCraftingOutcomeFlow(input);
}

const prompt = ai.definePrompt({
  name: "evaluateCraftingOutcomePrompt",
  input: { schema: EvaluateCraftingOutcomeInputSchema },
  output: { schema: EvaluateCraftingOutcomeOutputSchema },
  prompt: `You are an expert Storyteller for the Exalted 3rd Edition roleplaying game. Your task is to evaluate the outcome of a crafting roll based on the provided project details and the number of successes rolled. Generate a descriptive and flavorful title and description for the outcome, and calculate the experience points gained based on the rules provided.

**CRAFTING RULES:**

*   **PROJECT CATEGORIES:**
    *   **Basic:** Simple tasks.
    *   **Major:** Significant endeavors.
    *   **Superior:** Artifacts (2-5 dots) or large-scale construction.
    *   **Legendary:** N/A-rated Artifacts.

*   **BASIC OBJECTIVES (Max 3 per project, determines XP reward):**
    1.  Create/strengthen an Intimacy in another character towards you.
    2.  Gain a clear in-game benefit (money, Merit).
    3.  Uphold/further/protect one of your own Intimacies.

*   **PROJECT MECHANICS & REWARDS:**

    *   **BASIC PROJECT (Creation):**
        *   **Roll:** vs. Storyteller difficulty.
        *   **Exceptional Success:** Occurs when successes >= difficulty + 3.
        *   **Creation Reward (per objective met):** 2 sxp (3 sxp if exceptional).
    *   **BASIC PROJECT (Repair):**
        *   **Repair Reward (per objective met):** 1 sxp.

    *   **MAJOR PROJECT (Creation):**
        *   **Roll:** vs. Storyteller difficulty.
        *   **Exceptional Success:** Occurs when successes >= difficulty + 3.
        *   **Creation Reward (per objective met):** 2 gxp and 1 sxp (3 gxp and 1 sxp if exceptional).
    *   **MAJOR PROJECT (Repair):**
        *   **Repair Reward (per objective met):** 1 gxp.

    *   **SUPERIOR PROJECT (Artifacts - Creation):**
        *   **Roll:** Part of an extended roll (Difficulty 5, Terminus 6).
        *   **Creation Reward (if >=1 objective met):** 3 wxp for Artifact 2, 5 wxp for Artifact 3, 7 wxp for Artifact 4, 9 wxp for Artifact 5.
        *   **Creation Bonus:** (Artifact Rating * 2) gxp per unused interval remaining.
    *   **SUPERIOR PROJECT (Artifacts - Repair):**
        *   **Repair Reward:** (Artifact Rating - 1) wxp. No gxp bonus.

    *   **LEGENDARY PROJECT (N/A Artifacts - Creation):**
        *   **Roll:** Part of an extended roll (Difficulty 5, Terminus 6).
        *   **Creation Reward (if >=1 objective met):** 10 wxp.
        *   **Creation Bonus:** Roll a free Craft Excellency. Gain 1 gxp per success, and 1 sxp per non-success die.
    *   **LEGENDARY PROJECT (N/A Artifacts - Repair):**
        *   **Repair Reward:** 0 xp.

**INPUT FOR EVALUATION:**
*   **Project Type:** {{{project.type}}}
*   **Artifact Rating:** {{#if project.artifactRating}}{{project.artifactRating}}{{else}}N/A{{/if}}
*   **Objectives Met:** {{{project.objectivesMet}}}
*   **Total Successes Rolled:** {{{successes}}}
*   **Target Number / Difficulty:** {{{targetNumber}}}
*   **Is Exceptional Success?** {{{isExceptional}}}
*   **Intervals Remaining (Superior/Legendary only):** {{#if intervalsRemaining}}{{intervalsRemaining}}{{else}}N/A{{/if}}
*   **Legendary Bonus Roll Results:** {{#if legendaryBonusRoll}}{{#each legendaryBonusRoll as |roll|}}{{roll}}, {{/each}}{{else}}N/A{{/if}}
*   **Active Charm Effects:** {{#if charmEffects}}{{charmEffects}}{{else}}None{{/if}}

**YOUR TASK:**
1.  **Analyze Success:** The roll is successful if successes >= targetNumber. Describe the quality of the work based on the margin of success.
2.  **Calculate XP:** Strictly follow the rules above to calculate the sxp, gxp, and wxp gained. The project type will specify if it's a 'creation' or 'repair' task. Apply the correct reward structure. If a project type doesn't award a certain XP type, the value must be 0.
3.  **Write Title & Description:** Create a short, flavorful title and a descriptive paragraph for the outcome, consistent with the Exalted setting. Weave in the number of successes and any charm effects into the narrative.
4.  **Format Output:** Your response MUST be a single, valid JSON object that conforms to the specified output schema. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
`,
});

const evaluateCraftingOutcomeFlow = ai.defineFlow(
  {
    name: "evaluateCraftingOutcomeFlow",
    inputSchema: EvaluateCraftingOutcomeInputSchema,
    outputSchema: EvaluateCraftingOutcomeOutputSchema,
  },
  async (input) => {
    try {
      const result = await prompt(input);
      // In Genkit 1.x, the structured output is directly available on `output()`
      return result.output!;
    } catch (error) {
       console.error(
        "Error evaluating crafting outcome, attempting to fix JSON:",
        error,
      );
      // Fallback for when the model doesn't return perfect JSON
      const result = await prompt(input);
      const text = result.text; // Use .text in v1.x
      try {
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]);
        }
        // If no markdown, try to parse the whole thing
        return JSON.parse(text);
      } catch (parseError) {
         console.error("Failed to parse even after cleanup:", parseError, "Raw text was:", text);
         // Return a structured error if all else fails
         return {
           isSuccess: false,
           outcomeTitle: "Error in AI Response",
           outcomeDescription: "The AI's response was not valid JSON. Please check the console for more details.",
           experienceGained: { sxp: 0, gxp: 0, wxp: 0 },
         };
      }
    }
  },
);
