"use client";

import { Button } from "@repo/ui/components/ui/button";
import { PatientAppShell } from "@/components/common";
import { SettingsForm } from "./components/settings-form";
import { useSettingsScreen } from "./hook";

const SettingsScreen = () => {
	const screen = useSettingsScreen();

	return (
		<PatientAppShell title="Settings">
			<div className="space-y-5">
				<div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-sm">
					<SettingsForm screen={screen} />
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
