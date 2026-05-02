"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	BriefcaseBusinessIcon,
	FolderIcon,
	HouseIcon,
	MessageCircleIcon,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
	CASES_URL,
	CHAT_URL,
	DASHBOARD_URL,
	FILES_URL,
	PROFILE_URL,
	SETTINGS_URL,
} from "@/config/client-constants";

const TABS = [
	{ label: "HOME", href: DASHBOARD_URL, icon: HouseIcon },
	{ label: "CASES", href: CASES_URL, icon: BriefcaseBusinessIcon },
	{ label: "FILES", href: FILES_URL, icon: FolderIcon },
	{ label: "CHAT", href: CHAT_URL, icon: MessageCircleIcon },
	{ label: "PROFILE", href: PROFILE_URL, icon: UserIcon },
] as const;

const TopBar = (props: { title: string; rightActionHref?: string }) => {
	const rightHref = props.rightActionHref ?? SETTINGS_URL;

	return (
		<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-neutral-warm/95 px-4 backdrop-blur supports-backdrop-filter:bg-neutral-warm/85 md:px-6">
			<h1 className="text-base font-semibold text-font-primary">{props.title}</h1>
			<Button
				asChild
				variant="ghost"
				size="icon-sm"
				className="text-font-secondary hover:text-font-primary"
			>
				<Link href={rightHref} aria-label="Open settings">
					<SettingsIcon className="size-5" />
				</Link>
			</Button>
		</header>
	);
};

const BottomTabs = () => {
	const pathname = usePathname();

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 md:pb-5">
			<nav className="pointer-events-auto flex h-[62px] w-full max-w-[430px] items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm md:w-fit md:min-w-[540px]">
				{TABS.map((tab) => {
					const Icon = tab.icon;
					const isActive = pathname === tab.href;

					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={`flex h-full flex-1 flex-col items-center justify-center rounded-full px-3 ${
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<Icon className="size-[18px]" />
							<span className="mt-1 text-[10px] font-medium tracking-[0.5px]">
								{tab.label}
							</span>
						</Link>
					);
				})}
			</nav>
		</div>
	);
};

export const PatientAppShell = (props: {
	title: string;
	children: React.ReactNode;
	rightActionHref?: string;
}) => {
	return (
		<div className="min-h-svh bg-neutral-warm">
			<TopBar title={props.title} rightActionHref={props.rightActionHref} />
			<main className="mx-auto w-full max-w-[640px] px-4 pb-28 pt-4 md:px-6 md:pb-32">
				{props.children}
			</main>
			<BottomTabs />
		</div>
	);
};
