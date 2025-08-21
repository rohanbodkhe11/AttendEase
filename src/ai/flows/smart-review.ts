// src/ai/flows/smart-review.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered attendance review suggestions to faculty members.
 *
 * - `getAttendanceSuggestions` - A function that takes current attendance and past records to suggest corrections.
 * - `AttendanceReviewInput` - The input type for the `getAttendanceSuggestions` function.
 * - `AttendanceSuggestion` - The type representing a single attendance suggestion.
 * - `AttendanceReviewOutput` - The return type for the `getAttendanceSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Zod schema for a single attendance record
const AttendanceRecordSchema = z.object({
  studentId: z.string().describe('Unique identifier for the student'),
  date: z.string().describe('Date of the attendance record (YYYY-MM-DD)'),
  isPresent: z.boolean().describe('Whether the student was present or absent'),
});

// Define Zod schema for the input to the smart review flow
const AttendanceReviewInputSchema = z.object({
  currentAttendance: z.array(AttendanceRecordSchema).describe('The current attendance record to be reviewed'),
  pastAttendance: z.array(AttendanceRecordSchema).describe('Past attendance records for the same class'),
  classInfo: z.string().describe('Information about the class, including course name and time'),
});

export type AttendanceReviewInput = z.infer<typeof AttendanceReviewInputSchema>;

// Define Zod schema for a single attendance suggestion
const AttendanceSuggestionSchema = z.object({
  studentId: z.string().describe('The student ID for whom the suggestion is made'),
  date: z.string().describe('The date of the attendance record'),
  suggestedPresence: z.boolean().describe('The AI suggested attendance status (true for present, false for absent)'),
  reason: z.string().describe('The reason for the suggested change'),
});

export type AttendanceSuggestion = z.infer<typeof AttendanceSuggestionSchema>;

// Define Zod schema for the output of the smart review flow
const AttendanceReviewOutputSchema = z.object({
  suggestions: z.array(AttendanceSuggestionSchema).describe('A list of attendance correction suggestions'),
});

export type AttendanceReviewOutput = z.infer<typeof AttendanceReviewOutputSchema>;

// Exported function to call the flow
export async function getAttendanceSuggestions(input: AttendanceReviewInput): Promise<AttendanceReviewOutput> {
  return smartReviewFlow(input);
}

// Define the prompt
const smartReviewPrompt = ai.definePrompt({
  name: 'smartReviewPrompt',
  input: {
    schema: AttendanceReviewInputSchema,
  },
  output: {
    schema: AttendanceReviewOutputSchema,
  },
  prompt: `You are an AI assistant designed to help faculty review attendance records and identify potential mistakes.

  Analyze the current attendance record in conjunction with the past attendance records to identify anomalies and suggest corrections.

  Consider factors like student's historical attendance patterns, and any other relevant information to provide accurate suggestions.

  Class Information: {{{classInfo}}}

Current Attendance Record:
  {{#each currentAttendance}}
    - Student ID: {{studentId}}, Date: {{date}}, Present: {{isPresent}}
  {{/each}}

Past Attendance Records:
  {{#each pastAttendance}}
    - Student ID: {{studentId}}, Date: {{date}}, Present: {{isPresent}}
  {{/each}}

  Provide suggestions for any corrections that should be made, along with a reason for each suggestion.
  Ensure the output is a valid JSON array of suggestions.
  `, // Ensure output is valid JSON
});

// Define the flow
const smartReviewFlow = ai.defineFlow(
  {
    name: 'smartReviewFlow',
    inputSchema: AttendanceReviewInputSchema,
    outputSchema: AttendanceReviewOutputSchema,
  },
  async input => {
    const {output} = await smartReviewPrompt(input);
    return output!;
  }
);

