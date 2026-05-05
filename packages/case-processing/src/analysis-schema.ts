import { z } from "zod";

export const keySymptomSchema = z.object({
	description: z.string(),
	severity: z.enum(["High", "Med", "Low"]),
});

export const caseAnalysisOutputSchema = z.object({
	detected_specialty: z.string().nullable().optional(),
	urgency_level: z.enum(["Critical", "High", "Moderate", "Low"]).nullable().optional(),
	ai_confidence: z.number().nullable().optional(),
	key_symptoms: z.array(keySymptomSchema).optional(),
	ai_summary: z.string(),
	collected_information: z.object({
		symptoms: z.array(z.string()).optional(),
		medical_history: z.array(z.string()).optional(),
		medications: z.array(z.string()).optional(),
		allergies: z.array(z.string()).optional(),
		additional: z.record(z.string(), z.unknown()).optional(),
	}).optional(),
});

export type CaseAnalysisOutput = z.infer<typeof caseAnalysisOutputSchema>;
export type KeySymptom = z.infer<typeof keySymptomSchema>;
