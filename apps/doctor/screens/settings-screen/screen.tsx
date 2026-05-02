"use client";

import { ComingSoon, DoctorAppShell } from "@/components/common";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { MoonStarIcon, SunIcon } from "lucide-react";
import { useSettingsScreen } from "./hook";

const SettingsScreen = () => {
	const screen = useSettingsScreen();

	return (
		<DoctorAppShell title={screen.title}>
			<div className="space-y-6">
				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Choose the theme used across your doctor workspace.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-medium text-foreground">Theme</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Light is the default. Dark mode is tuned for clinical dashboards.
								</p>
							</div>
							<div className="inline-flex w-fit rounded-xl border border-border bg-background p-1">
								<Button
									type="button"
									variant={screen.theme === "light" ? "default" : "ghost"}
									size="sm"
									className="h-8 rounded-lg px-3"
									onClick={() => screen.setTheme("light")}
								>
									<SunIcon className="size-4" />
									Light
								</Button>
								<Button
									type="button"
									variant={screen.theme === "dark" ? "default" : "ghost"}
									size="sm"
									className="h-8 rounded-lg px-3"
									onClick={() => screen.setTheme("dark")}
								>
									<MoonStarIcon className="size-4" />
									Dark
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
				<ComingSoon title={screen.title} description={screen.description} />
			</div>
		</DoctorAppShell>
	);
};

export default SettingsScreen;

