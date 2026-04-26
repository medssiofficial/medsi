import { cn } from "../../lib/utils";

type DoctorLogoSize = "sm" | "md" | "lg";
type DoctorLogoVariant = "default" | "sidebar";

interface DoctorLogoProps {
	size?: DoctorLogoSize;
	variant?: DoctorLogoVariant;
	showLabel?: boolean;
	className?: string;
}

const sizeConfig: Record<DoctorLogoSize, { brand: string; label: string }> = {
	sm: { brand: "text-base", label: "text-[10px]" },
	md: { brand: "text-xl", label: "text-[11px]" },
	lg: { brand: "text-2xl", label: "text-xs" },
};

const variantConfig: Record<
	DoctorLogoVariant,
	{ brand: string; label: string }
> = {
	default: {
		brand: "text-foreground",
		label: "text-muted-foreground",
	},
	sidebar: {
		brand: "text-sidebar-foreground",
		label: "text-medssi-green-light",
	},
};

export const DoctorLogo = ({
	size = "md",
	variant = "default",
	showLabel = true,
	className,
}: DoctorLogoProps) => {
	const s = sizeConfig[size];
	const v = variantConfig[variant];

	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<span className={cn("font-heading font-bold", s.brand, v.brand)}>
				Medssi
			</span>
			{showLabel && (
				<span className={cn("font-sans font-medium", s.label, v.label)}>
					Doctor
				</span>
			)}
		</div>
	);
};
