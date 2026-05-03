export const getEmbeddingStatusLabel = (status: string | null | undefined) => {
	switch (status) {
		case "pending":
			return "Processing";
		case "synced":
			return "Synced";
		case "failed":
			return "Failed";
		case "not_embedded":
		default:
			return "Not embedded";
	}
};

export const getEmbeddingBadgeVariant = (
	status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" => {
	switch (status) {
		case "synced":
			return "default";
		case "pending":
			return "secondary";
		case "failed":
			return "destructive";
		default:
			return "outline";
	}
};
