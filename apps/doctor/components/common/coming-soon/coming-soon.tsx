"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Hourglass } from "lucide-react";
import { useComingSoon } from "./hook";

export const ComingSoon = (props: { title: string; description?: string }) => {
	const { title, description } = useComingSoon(props);

	return (
		<div className="w-full">
			<Card className="max-w-2xl">
				<CardHeader>
					<div className="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-medssi-green-surface text-medssi-green">
						<Hourglass className="size-5" />
					</div>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						We will connect real data and production-ready widgets in the next step.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

