import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Medssi",
		short_name: "Medssi",
		description: "AI-powered medical consultation platform for patients.",
		start_url: "/",
		display: "standalone",
		background_color: "#FAF7F2",
		theme_color: "#0F6E6E",
		orientation: "portrait-primary",
		categories: ["health", "medical"],
		icons: [
			{
				src: "/icons/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icons/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
		],
	};
}
