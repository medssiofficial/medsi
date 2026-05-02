"use client";

import { Clock3Icon } from "lucide-react";

export const ComingSoon = (props: { title: string; description: string }) => {
	return (
		<div className="rounded-2xl border border-border-subtle bg-card p-5">
			<div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<Clock3Icon className="size-5" />
			</div>
			<h2 className="text-lg font-semibold text-font-primary">{props.title}</h2>
			<p className="mt-1 text-sm text-font-secondary">{props.description}</p>
			<p className="mt-3 text-xs text-font-tertiary">
				We are building this section and will connect it with production data soon.
			</p>
		</div>
	);
};
