import z from "zod";

export const patientFileChunkPartialSchema = z.object({
	key_points: z.array(z.string()),
	named_entities: z.array(z.string()).optional(),
});

export type PatientFileChunkPartial = z.infer<typeof patientFileChunkPartialSchema>;

export const patientFileFinalSummarySchema = z.object({
	title: z.string(),
	language_detected: z.string().optional(),
	key_findings: z.array(z.string()),
	possible_diagnoses_or_conditions: z.array(z.string()),
	medications_or_treatments_mentioned: z.array(z.string()),
	dates_and_follow_up: z.array(z.string()),
	patient_actions_recommended: z.array(z.string()),
	confidence_notes: z.string().optional(),
});

export type PatientFileFinalSummary = z.infer<typeof patientFileFinalSummarySchema>;
