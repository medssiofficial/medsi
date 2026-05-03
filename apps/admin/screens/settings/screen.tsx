"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { MoonStarIcon, SunIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useSettingsScreen } from "./hook";

const SETTINGS_EMBEDDING_LOGS_HREF = "/settings/embedding-logs";

const SettingsScreen = () => {
	const screen = useSettingsScreen();

	return (
		<AdminShell>
			<div className="max-w-3xl space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Choose the theme used across the admin console.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-medium text-foreground">Theme</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Light is the default. Dark mode uses the Medssi admin palette.
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

				<Card>
					<CardHeader>
						<CardTitle>Doctor Embedding Logs</CardTitle>
						<CardDescription>
							View the audit trail for doctor profile embedding jobs (successes and
							failures).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="secondary" className="w-full sm:w-auto" asChild>
							<Link
								href={SETTINGS_EMBEDDING_LOGS_HREF}
								className="inline-flex items-center gap-2"
							>
								Open embedding logs
								<ChevronRightIcon className="size-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</AdminShell>
	);
};

export default SettingsScreen;

