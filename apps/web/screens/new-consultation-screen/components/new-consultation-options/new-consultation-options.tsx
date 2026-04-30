"use client";

import type { NewConsultationOption } from "../../hook";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronRightIcon, InfoIcon } from "lucide-react";
import { useNewConsultationOptions } from "./hook";

interface NewConsultationOptionsProps {
	onOptionClick: (option: NewConsultationOption) => void;
	options: NewConsultationOption[];
}

export const NewConsultationOptions = (props: NewConsultationOptionsProps) => {
	const { onOptionClick, options } = props;
	const { getIcon } = useNewConsultationOptions();

	return (
		<div className="space-y-5">
			<div className="space-y-2 px-1">
				<h2 className="text-2xl font-bold leading-tight text-font-primary">
					How would you like to describe your case?
				</h2>
				<p className="text-sm text-font-secondary">
					Our AI will guide you step by step
				</p>
			</div>

			<div className="rounded-lg border-l-4 border-[#2563EB] bg-[#DBEAFE] p-3">
				<div className="flex items-start gap-2">
					<InfoIcon className="mt-0.5 size-4 shrink-0 text-[#2563EB]" />
					<p className="text-xs text-font-primary">
						AI-generated content. Always verify with your healthcare provider.
					</p>
				</div>
			</div>

			<div className="space-y-3">
				{options.map((option) => {
					const Icon = getIcon(option.icon);
					return (
						<Button
							key={option.key}
							type="button"
							variant="ghost"
							onClick={() => onOptionClick(option)}
							className="h-auto w-full justify-between rounded-2xl border border-[#E2E6EC] bg-white p-4 text-left hover:bg-[#F8FAFC]"
						>
							<span className="flex min-w-0 items-center gap-3">
								<span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EBF6F5]">
									<Icon className="size-5 text-primary" />
								</span>
								<span className="min-w-0">
									<span className="block text-sm font-semibold text-font-primary">
										{option.title}
									</span>
									<span className="mt-0.5 block text-xs text-font-secondary">
										{option.description}
									</span>
								</span>
							</span>
							<ChevronRightIcon className="size-4 shrink-0 text-font-secondary" />
						</Button>
					);
				})}
			</div>

			<div className="border-t border-border-subtle pt-3">
				<p className="text-xs text-font-secondary">
					You can also combine multiple methods.
				</p>
			</div>
		</div>
	);
};
