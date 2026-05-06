"use client";

import { SETTINGS_FILE_PROCESSING_LOGS_URL } from "@/config/client-constants";
import { PatientAppShell } from "@/components/common";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronRightIcon, MoonStarIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { SettingsForm } from "./components/settings-form";
import { useSettingsScreen } from "./hook";

const SettingsScreen = () => {
	const screen = useSettingsScreen();

	return (
		<PatientAppShell title="Settings">
			<div className="space-y-5">
				<div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-sm">
					<SettingsForm screen={screen} />
				</div>
				<div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-sm">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold text-font-primary">Appearance</p>
							<p className="mt-1 text-xs text-font-tertiary">
								Choose how Medssi looks for you.
							</p>
						</div>
						<div className="inline-flex rounded-xl border border-border-subtle bg-muted p-1">
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
				</div>
				<div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-sm">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm font-semibold text-font-primary">File processing logs</p>
							<p className="mt-1 text-xs text-font-tertiary">
								See outcomes for automated text report processing on your files.
							</p>
						</div>
						<Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
							<Link
								href={SETTINGS_FILE_PROCESSING_LOGS_URL}
								className="inline-flex items-center gap-2"
							>
								Open logs
								<ChevronRightIcon className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					className="h-12 w-full rounded-xl border-destructive text-destructive hover:bg-destructive/10"
					onClick={() => void screen.handleLogout()}
				>
					Log Out
				</Button>
			</div>
		</PatientAppShell>
	);
};

export default SettingsScreen;
