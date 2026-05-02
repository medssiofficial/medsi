"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { PatientAppShell } from "@/components/common";
import { ProfileForm } from "./components/profile-form";
import { useProfileScreen } from "./hook";

const ProfileScreen = () => {
	const screen = useProfileScreen();
	const user = screen.clerkUser.user;
	const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "U";

	return (
		<PatientAppShell title="Profile">
			<div className="space-y-4">
				<div className="rounded-2xl border border-border-subtle bg-card p-5">
					<div className="flex flex-col items-center gap-2 text-center">
						<Avatar size="lg">
							{user?.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.fullName ?? "Profile"} /> : null}
							<AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
						</Avatar>
						<p className="text-lg font-semibold text-font-primary">
							{user?.fullName ?? "Patient"}
						</p>
						<p className="text-sm text-font-secondary">
							{user?.primaryEmailAddress?.emailAddress ?? "No email"}
						</p>
					</div>
				</div>
				<div className="rounded-2xl border border-border-subtle bg-card p-5">
					<div className="mb-4 flex items-center justify-between">
						<p className="text-sm font-semibold text-font-primary">
							Personal Information
						</p>
						{!screen.isEditing ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={screen.handleEdit}
							>
								Edit
							</Button>
						) : null}
					</div>
					<ProfileForm screen={screen} />
				</div>
				<Button
					type="button"
					className="h-12 w-full rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
					onClick={() => void screen.handleLogout()}
				>
					Log Out
				</Button>
			</div>
		</PatientAppShell>
	);
};

export default ProfileScreen;
