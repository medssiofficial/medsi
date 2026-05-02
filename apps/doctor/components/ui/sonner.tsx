"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useAppTheme } from "@repo/providers";
import {
	CircleCheckIcon,
	InfoIcon,
	TriangleAlertIcon,
	OctagonXIcon,
	Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "light" } = useAppTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--success-bg": "var(--success-surface)",
					"--success-text": "var(--foreground)",
					"--success-border": "var(--success)",
					"--error-bg": "color-mix(in oklab, var(--destructive) 12%, var(--popover))",
					"--error-text": "var(--foreground)",
					"--error-border": "var(--destructive)",
					"--warning-bg": "var(--warning-surface)",
					"--warning-text": "var(--foreground)",
					"--warning-border": "var(--warning)",
					"--info-bg": "color-mix(in oklab, var(--primary) 10%, var(--popover))",
					"--info-text": "var(--foreground)",
					"--info-border": "var(--primary)",
					"--border-radius": "var(--radius)",
				} as CSSProperties
			}
			toastOptions={{
				classNames: {
					toast:
						"cn-toast rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10",
					title: "font-medium text-sm leading-none tracking-tight",
					description: "text-sm text-muted-foreground leading-relaxed",
					actionButton:
						"inline-flex h-8 items-center rounded-md bg-foreground px-3 text-xs font-medium text-background hover:opacity-90",
					cancelButton:
						"inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted",
					closeButton:
						"rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
					success:
						"border-success/30 bg-success-surface text-foreground [&_[data-icon]]:text-success",
					error:
						"border-destructive/30 bg-[color-mix(in_oklab,var(--destructive)_10%,var(--popover))] text-foreground [&_[data-icon]]:text-destructive",
					warning:
						"border-warning/40 bg-warning-surface text-foreground [&_[data-icon]]:text-warning",
					info: "border-primary/30 bg-[color-mix(in_oklab,var(--primary)_10%,var(--popover))] text-foreground [&_[data-icon]]:text-primary",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
