import { CASE_ANALYSIS_MAX_CONTEXT_CHARS } from "./constants";

interface PatientContext {
	name: string;
	age: number;
	gender: string;
	email: string;
	country: string;
}

interface ChatMessage {
	role: "assistant" | "user";
	content: string;
}

interface FileProcessedData {
	filename: string;
	summary?: unknown;
	extracted_text?: string;
}

interface BuildAnalysisPromptArgs {
	patient: PatientContext;
	messages: ChatMessage[];
	collected_data: Record<string, unknown>;
	file_summaries: FileProcessedData[];
}

export const buildAnalysisPrompt = (args: BuildAnalysisPromptArgs): string => {
	const parts: string[] = [];

	parts.push(`You are a medical AI assistant performing a comprehensive intake analysis.`);
	parts.push(`\n## Patient Profile`);
	parts.push(`- Name: ${args.patient.name}`);
	parts.push(`- Age: ${args.patient.age}`);
	parts.push(`- Gender: ${args.patient.gender}`);
	parts.push(`- Country: ${args.patient.country}`);

	parts.push(`\n## Chat Conversation`);
	for (const msg of args.messages) {
		parts.push(`[${msg.role.toUpperCase()}]: ${msg.content}`);
	}

	if (Object.keys(args.collected_data).length > 0) {
		parts.push(`\n## Collected Structured Data`);
		parts.push(JSON.stringify(args.collected_data, null, 2));
	}

	if (args.file_summaries.length > 0) {
		parts.push(`\n## Medical Documents`);
		for (const file of args.file_summaries) {
			parts.push(`\n### Document: ${file.filename}`);
			if (file.summary && typeof file.summary === "object") {
				parts.push(`Summary: ${JSON.stringify(file.summary, null, 2)}`);
			}
			if (file.extracted_text) {
				parts.push(`Extracted text (truncated): ${file.extracted_text.slice(0, 10000)}`);
			}
		}
	}

	parts.push(`\n## Instructions`);
	parts.push(`Analyze all the information above and produce a JSON response with this exact structure:`);
	parts.push(`{
  "detected_specialty": "the most relevant medical specialty (e.g. Neurology, Cardiology, General Medicine)",
  "urgency_level": "Critical" | "High" | "Moderate" | "Low",
  "ai_confidence": number between 0 and 100,
  "key_symptoms": [{ "description": "symptom description", "severity": "High" | "Med" | "Low" }],
  "ai_summary": "A comprehensive 2-4 sentence summary of the patient's condition and key findings",
  "collected_information": {
    "symptoms": ["list of identified symptoms"],
    "medical_history": ["relevant medical history items"],
    "medications": ["current medications if any"],
    "allergies": ["known allergies if any"],
    "additional": { "any other relevant structured data" }
  }
}`);
	parts.push(`\nBe thorough but concise. Base your analysis strictly on the provided data. If information is not available, use null for optional fields.`);

	let prompt = parts.join("\n");
	if (prompt.length > CASE_ANALYSIS_MAX_CONTEXT_CHARS) {
		prompt = prompt.slice(0, CASE_ANALYSIS_MAX_CONTEXT_CHARS);
	}

	return prompt;
};
