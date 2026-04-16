import { cn } from "../../lib/utils";

type DoctorLogoSize = "sm" | "md" | "lg";

interface DoctorLogoProps {
	size?: DoctorLogoSize;
	showLabel?: boolean;
	className?: string;
}

const sizeConfig: Record<DoctorLogoSize, { brand: string; label: string }> = {
	sm: { brand: "text-base", label: "text-[10px]" },
	md: { brand: "text-xl", label: "text-[11px]" },
	lg: { brand: "text-2xl", label: "text-xs" },
};

export const DoctorLogo = ({
	size = "md",
	showLabel = true,
	className,
}: DoctorLogoProps) => {
	const s = sizeConfig[size];

	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<span
				className={cn("font-heading font-bold text-foreground", s.brand)}
			>
				Medssi
			</span>
			{showLabel && (
				<span
					className={cn(
						"font-sans font-medium text-muted-foreground",
						s.label,
					)}
				>
					Doctor
				</span>
			)}
		</div>
	);
};
