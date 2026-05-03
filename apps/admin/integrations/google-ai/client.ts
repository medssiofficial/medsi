import { GoogleGenAI } from "@google/genai";

import { getGoogleGenAiApiKey } from "./config";

export function createGoogleGenAiClient(): GoogleGenAI {
	return new GoogleGenAI({ apiKey: getGoogleGenAiApiKey() });
}
