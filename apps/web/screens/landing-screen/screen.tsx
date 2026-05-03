import Link from "next/link";
import {
	GlobeIcon,
	HeartPulseIcon,
	PhoneIcon,
	ShieldCheckIcon,
	StethoscopeIcon,
} from "lucide-react";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/config/client-constants";

const TrustItem = (props: {
	icon: React.ReactNode;
	label: string;
}) => {
	return (
		<div className="flex items-center gap-1.5">
			<span className="text-primary">{props.icon}</span>
			<span className="text-[13px] font-medium text-[#3D4654]">
				{props.label}
			</span>
		</div>
	);
};

const LandingScreen = () => {
	return (
		<div className="flex min-h-svh w-full flex-col items-center bg-neutral-warm">
			<div className="flex w-full max-w-[430px] flex-1 flex-col justify-center px-6 pb-8 pt-safe-top">
				<div className="flex flex-1 flex-col justify-center gap-0">
					<div className="mb-8 flex flex-col items-center gap-3">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-primary">
							<HeartPulseIcon className="size-8 text-white" />
						</div>
						<span className="text-[28px] font-bold leading-none text-font-primary">
							Medssi
						</span>
					</div>

					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-[28px] font-bold leading-tight text-font-primary">
							Your Health, Simplified
						</h1>
						<p className="text-[15px] text-font-secondary">
							AI-powered medical consultation platform
						</p>
					</div>
				</div>

				<div className="space-y-3">
					<Link
						href={SIGN_UP_URL}
						className="flex h-13 w-full items-center justify-center rounded-lg bg-primary text-base font-semibold text-white transition-opacity active:opacity-80"
					>
						Get Started
					</Link>
					<Link
						href={SIGN_IN_URL}
						className="flex h-13 w-full items-center justify-center rounded-lg border border-border bg-card text-base font-semibold text-grey-600 transition-opacity active:opacity-80"
					>
						Sign In
					</Link>
				</div>

				<div className="mt-6 flex items-center justify-center gap-6">
					<TrustItem
						icon={<ShieldCheckIcon className="size-4" />}
						label="Secure"
					/>
					<TrustItem
						icon={<GlobeIcon className="size-4" />}
						label="Multilingual"
					/>
					<TrustItem
						icon={<StethoscopeIcon className="size-4" />}
						label="Verified Doctors"
					/>
				</div>

				<div className="mt-3 flex items-center justify-center gap-1.5">
					<PhoneIcon className="size-3.5 text-font-tertiary" />
					<span className="text-xs text-font-tertiary">
						Support: +1 (800) 123-4567
					</span>
				</div>
			</div>
		</div>
	);
};

export default LandingScreen;
