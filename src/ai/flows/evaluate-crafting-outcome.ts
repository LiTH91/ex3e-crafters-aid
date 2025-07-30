"use server";
/**
 * @fileOverview Evaluates the outcome of a crafting check using generative AI.
 *
 * - evaluateCraftingOutcome - A function that evaluates the crafting outcome.
 * - EvaluateCraftingOutcomeInput - The input type for the evaluateCraftingOutcome function.
 * - EvaluateCraftingOutcomeOutput - The return type for the evaluateCraftingOutcome function.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface EvaluateCraftingOutcomeInput {
  project: {
    type: "Basic" | "Major" | "Superior" | "Legendary";
    isRepair: boolean;
    artifactRating: number;
    objectivesMet: number;
  };
  successes: number;
  targetNumber: number;
  charmEffects?: string;
  isExceptional: boolean;
  intervalsRemaining?: number;
  legendaryBonusRoll?: number[];
}

export interface EvaluateCraftingOutcomeOutput {
  isSuccess: boolean;
  outcomeTitle: string;
  outcomeDescription: string;
  experienceGained: {
    sxp: number;
    gxp: number;
    wxp: number;
  };
}

export async function evaluateCraftingOutcome(
  input: EvaluateCraftingOutcomeInput,
): Promise<EvaluateCraftingOutcomeOutput> {
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY as string,
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert Storyteller for the Exalted 3rd Edition roleplaying game. Your task is to evaluate the outcome of a crafting roll based on the provided project details and the number of successes rolled. Generate a descriptive and flavorful title and description for the outcome, and calculate the experience points gained based on the rules provided.

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

    *   **BASIC PROJECT:**
        *   **Roll:** vs. Storyteller difficulty.
        *   **Exceptional Success:** Occurs when successes >= difficulty + 3.
        *   **Creation Reward (per objective met):** 2 sxp (3 sxp if exceptional).
        *   **Repair Reward (per objective met):** 1 sxp.

    *   **MAJOR PROJECT:**
        *   **Roll:** vs. Storyteller difficulty.
        *   **Exceptional Success:** Occurs when successes >= difficulty + 3.
        *   **Creation Reward (per objective met):** 2 gxp and 1 sxp (3 gxp and 1 sxp if exceptional).
        *   **Repair Reward (per objective met):** 1 gxp.

    *   **SUPERIOR PROJECT (Artifacts):**
        *   **Roll:** Part of an extended roll (Difficulty 5, Terminus 6).
        *   **Creation Reward (if >=1 objective met):** 3 wxp for Artifact 2, 5 wxp for Artifact 3, 7 wxp for Artifact 4, 9 wxp for Artifact 5.
        *   **Creation Bonus:** (Artifact Rating * 2) gxp per unused interval remaining.
        *   **Repair Reward:** (Artifact Rating - 1) wxp. No gxp bonus.

    *   **LEGENDARY PROJECT (N/A Artifacts):**
        *   **Roll:** Part of an extended roll (Difficulty 5, Terminus 6).
        *   **Creation Reward (if >=1 objective met):** 10 wxp.
        *   **Creation Bonus:** Roll a free Craft Excellency. Gain 1 gxp per success, and 1 sxp per non-success die.
        *   **Repair Reward:** 0 xp.

**INPUT FOR EVALUATION:**
*   **Project Type:** ${input.project.type}
*   **Is Repair?** ${input.project.isRepair}
*   **Artifact Rating:** ${input.project.artifactRating > 0 ? input.project.artifactRating : 'N/A'}
*   **Objectives Met:** ${input.project.objectivesMet}
*   **Total Successes Rolled:** ${input.successes}
*   **Target Number / Difficulty:** ${input.targetNumber}
*   **Is Exceptional Success?** ${input.isExceptional}
*   **Intervals Remaining (Superior/Legendary only):** ${input.intervalsRemaining ?? 'N/A'}
*   **Legendary Bonus Roll Results:** ${input.legendaryBonusRoll?.join(', ') ?? 'N/A'}
*   **Active Charm Effects:** ${input.charmEffects || "None"}

**YOUR TASK:**
1.  **Analyze Success:** The roll is successful if successes >= targetNumber. Describe the quality of the work based on the margin of success.
2.  **Calculate XP:** Strictly follow the rules above to calculate the sxp, gxp, and wxp gained. If a project type doesn't award a certain XP type, the value must be 0.
3.  **Write Title & Description:** Create a short, flavorful title and a descriptive paragraph for the outcome, consistent with the Exalted setting. Weave in the number of successes and any charm effects into the narrative.
4.  **Format Output:** Return ONLY a single valid JSON object. Do not include markdown formatting like \`\`\`json.

**JSON Schema:**
{
  "isSuccess": boolean,
  "outcomeTitle": "string",
  "outcomeDescription": "string",
  "experienceGained": {
    "sxp": number,
    "gxp": number,
    "wxp": number
  }
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const parsedOutput: EvaluateCraftingOutcomeOutput = JSON.parse(text);
    return parsedOutput;
  } catch (error) {
    console.error("Error parsing AI response:", error, "Raw text:", text);
    // Fallback in case of parsing error
    return {
      isSuccess: false,
      outcomeTitle: "Error in AI Response",
      outcomeDescription: "The AI's response was not valid JSON. Please check the console for more details.",
      experienceGained: { sxp: 0, gxp: 0, wxp: 0 },
    };
  }
}
