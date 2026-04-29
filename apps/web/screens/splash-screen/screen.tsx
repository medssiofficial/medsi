import { HeartPulseIcon } from "lucide-react";
import { useSplashScreen } from "./hook";

export const SplashScreen = () => {
	const splash = useSplashScreen();

	return (
		<div className="flex min-h-svh w-full flex-col items-center justify-center bg-neutral-warm px-6">
			<div className="mb-8 flex flex-col items-center gap-3">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-primary">
					<HeartPulseIcon className="size-8 text-white" />
				</div>
				<span className="text-[28px] font-bold leading-none text-font-primary">
					{splash.title}
				</span>
			</div>
			<div className="space-y-2 text-center">
				<h1 className="text-[28px] font-bold leading-tight text-font-primary">
					{splash.headline}
				</h1>
				<p className="text-[15px] text-font-secondary">{splash.subhead}</p>
			</div>
		</div>
	);
};
