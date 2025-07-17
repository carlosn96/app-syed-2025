'use server';

/**
 * @fileOverview Moderates teacher evaluation content using AI to flag inappropriate or biased content.
 *
 * - moderateTeacherEvaluation - A function that moderates the evaluation content.
 * - ModerateTeacherEvaluationInput - The input type for the moderateTeacherEvaluation function.
 * - ModerateTeacherEvaluationOutput - The return type for the moderateTeacherEvaluation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTeacherEvaluationInputSchema = z.object({
  evaluationText: z
    .string()
    .describe('The text content of the teacher evaluation to be moderated.'),
});
export type ModerateTeacherEvaluationInput = z.infer<
  typeof ModerateTeacherEvaluationInputSchema
>;

const ModerateTeacherEvaluationOutputSchema = z.object({
  isFlagged: z
    .boolean()
    .describe(
      'Whether the evaluation text is flagged as inappropriate or biased.'
    ),
  flaggingReasons: z
    .array(z.string())
    .describe(
      'A list of reasons why the evaluation text was flagged, if any.'
    ),
});
export type ModerateTeacherEvaluationOutput = z.infer<
  typeof ModerateTeacherEvaluationOutputSchema
>;

export async function moderateTeacherEvaluation(
  input: ModerateTeacherEvaluationInput
): Promise<ModerateTeacherEvaluationOutput> {
  return moderateTeacherEvaluationFlow(input);
}

const moderateTeacherEvaluationPrompt = ai.definePrompt({
  name: 'moderateTeacherEvaluationPrompt',
  input: {schema: ModerateTeacherEvaluationInputSchema},
  output: {schema: ModerateTeacherEvaluationOutputSchema},
  prompt: `You are an AI assistant designed to moderate teacher evaluation text for inappropriate or biased content.

  Analyze the following evaluation text and determine if it contains any inappropriate language, personal attacks, discriminatory remarks, or biased statements.

  Based on your analysis, determine whether the evaluation should be flagged for review.

  Evaluation Text: {{{evaluationText}}}

  Respond with a JSON object indicating whether the evaluation is flagged and, if so, provide a list of reasons for flagging.`,
});

const moderateTeacherEvaluationFlow = ai.defineFlow(
  {
    name: 'moderateTeacherEvaluationFlow',
    inputSchema: ModerateTeacherEvaluationInputSchema,
    outputSchema: ModerateTeacherEvaluationOutputSchema,
  },
  async input => {
    const {output} = await moderateTeacherEvaluationPrompt(input);
    return output!;
  }
);
