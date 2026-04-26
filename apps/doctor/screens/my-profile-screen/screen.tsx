"use client";

import { DoctorAppShell } from "@/components/common";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { useMyProfileScreen } from "./hook";
import { ProfileContent } from "./components/profile-content";

const MyProfileScreen = () => {
	const { title, isLoading, isFetching, profileView } = useMyProfileScreen();

	return (
		<DoctorAppShell title={title}>
			<div className="space-y-4">
				{isFetching ? (
					<div className="flex items-center justify-end gap-2 text-xs text-font-secondary">
						<Spinner className="size-3.5" />
						<span>Refreshing profile...</span>
					</div>
				) : null}

				{isLoading ? (
					<div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
						<Skeleton className="h-80 rounded-xl" />
						<Skeleton className="h-[540px] rounded-xl" />
						<Skeleton className="h-72 rounded-xl" />
					</div>
				) : (
					<ProfileContent profileView={profileView} />
				)}
			</div>
		</DoctorAppShell>
	);
};

export default MyProfileScreen;

