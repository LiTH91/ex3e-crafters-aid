'use server';

/**
 * @fileOverview Evaluates the outcome of a crafting check using generative AI.
 *
 * - evaluateCraftingOutcome - A function that evaluates the crafting outcome.
 * - EvaluateCraftingOutcomeInput - The input type for the evaluateCraftingOutcome function.
 * - EvaluateCraftingOutcomeOutput - The return type for the evaluateCraftingOutcome function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCraftingOutcomeInputSchema = z.object({
  successes: z.number().describe('The number of successes rolled.'),
  targetNumber: z.number().describe('The target number for the crafting check.'),
  charmEffects: z.string().optional().describe('Any relevant Charm effects that modify the roll.'),
});
export type EvaluateCraftingOutcomeInput = z.infer<
  typeof EvaluateCraftingOutcomeInputSchema
>;

const EvaluateCraftingOutcomeOutputSchema = z.object({
  isSuccess: z.boolean().describe('Whether the crafting attempt was successful.'),
  outcomeDescription: z
    .string()
    .describe('A detailed description of the crafting outcome, including successes, failures, and consequences.'),
});
export type EvaluateCraftingOutcomeOutput = z.infer<
  typeof EvaluateCraftingOutcomeOutputSchema
>;

export async function evaluateCraftingOutcome(
  input: EvaluateCraftingOutcomeInput
): Promise<EvaluateCraftingOutcomeOutput> {
  return evaluateCraftingOutcomeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCraftingOutcomePrompt',
  input: {schema: EvaluateCraftingOutcomeInputSchema},
  output: {schema: EvaluateCraftingOutcomeOutputSchema},
  prompt: `You are an expert in Exalted 3rd Edition crafting rules. You will evaluate the outcome of a crafting check based on the number of successes rolled, the target number, and any relevant Charm effects.

  Determine whether the crafting attempt was successful or not, and provide a detailed description of the outcome, including successes, failures, and consequences based on the rules of Exalted 3rd Edition.

  Successes: {{{successes}}}
  Target Number: {{{targetNumber}}}
  Charm Effects: {{{charmEffects}}}

  Consider these Charm Effects when evaluating the outcome. If there are no Charm Effects, ignore the prior sentence.
`,
});

const evaluateCraftingOutcomeFlow = ai.defineFlow(
  {
    name: 'evaluateCraftingOutcomeFlow',
    inputSchema: EvaluateCraftingOutcomeInputSchema,
    outputSchema: EvaluateCraftingOutcomeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
