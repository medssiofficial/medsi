export const useComingSoon = (args: { title: string; description?: string }) => {
	return {
		title: args.title,
		description:
			args.description ??
			"This page is under active development. Widgets and live data will be added soon.",
	};
};

