type ContentPart =
	| { text: string }
	| { inlineData: { mimeType: string; data: string } };

interface GenerateContentArgs {
	apiKey: string;
	model: string;
	parts: ContentPart[];
	maxOutputTokens?: number;
	responseMimeType?: "application/json" | "text/plain";
}

const extractTextFromGenerateContentResponse = (json: unknown): string => {
	if (!json || typeof json !== "object") return "";
	const root = json as {
		candidates?: Array<{
			content?: { parts?: Array<{ text?: string }> };
		}>;
	};
	const text =
		root.candidates?.[0]?.content?.parts
			?.map((p) => (typeof p.text === "string" ? p.text : ""))
			.join("") ?? "";
	return text.trim();
};

export const callGeminiGenerateContent = async (
	args: GenerateContentArgs,
): Promise<string> => {
	const model = args.model.trim();
	if (!model) throw new Error("Gemini model is required.");

	const url = new URL(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
	);
	url.searchParams.set("key", args.apiKey);

	const body = {
		contents: [
			{
				role: "user",
				parts: args.parts,
			},
		],
		generationConfig: {
			temperature: 0.15,
			maxOutputTokens: args.maxOutputTokens ?? 8192,
			...(args.responseMimeType
				? { responseMimeType: args.responseMimeType }
				: {}),
		},
	};

	const response = await fetch(url.toString(), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const rawText = await response.text();
	let parsed: unknown = null;
	try {
		parsed = JSON.parse(rawText) as unknown;
	} catch {
		parsed = null;
	}

	if (!response.ok) {
		const msg =
			parsed &&
			typeof parsed === "object" &&
			"error" in parsed &&
			parsed.error &&
			typeof (parsed.error as { message?: unknown }).message === "string"
				? (parsed.error as { message: string }).message
				: rawText.slice(0, 500);
		throw new Error(`Gemini API error (${response.status}): ${msg}`);
	}

	return extractTextFromGenerateContentResponse(parsed);
};

export const parseJsonObjectFromModelText = (text: string): unknown => {
	const trimmed = text.trim();
	if (!trimmed) return null;
	try {
		return JSON.parse(trimmed) as unknown;
	} catch {
		const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
		if (fence?.[1]) {
			try {
				return JSON.parse(fence[1].trim()) as unknown;
			} catch {
				return null;
			}
		}
		const start = trimmed.indexOf("{");
		const end = trimmed.lastIndexOf("}");
		if (start >= 0 && end > start) {
			try {
				return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
			} catch {
				return null;
			}
		}
		return null;
	}
};
