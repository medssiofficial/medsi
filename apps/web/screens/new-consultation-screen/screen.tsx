"use client";

import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { NewConsultationOptions } from "./components";
import { useNewConsultationScreen } from "./hook";

const NewConsultationScreen = () => {
	const screen = useNewConsultationScreen();

	return (
		<div className="min-h-svh bg-neutral-warm">
			<header className="sticky top-0 z-30 border-b border-border-subtle bg-neutral-warm/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-warm/85">
				<div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-between px-4 md:px-6">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={screen.handleBack}
						aria-label="Go back"
					>
						<ArrowLeftIcon className="size-5 text-font-primary" />
					</Button>
					<h1 className="text-base font-semibold text-font-primary">
						New Consultation
					</h1>
					<div className="flex h-7 min-w-11 items-center justify-center rounded-full bg-[#EBF6F5] px-2.5 text-xs font-bold text-primary">
						EN
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-[640px] px-4 pb-10 pt-6 md:px-6">
				<NewConsultationOptions
					options={screen.options}
					onOptionClick={screen.handleOptionClick}
				/>
			</main>
		</div>
	);
};

export default NewConsultationScreen;
