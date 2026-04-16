import { HeartPulseIcon, type LucideProps } from "lucide-react";
import { cn } from "../../lib/utils";

type MedssiIconSize = "sm" | "md" | "lg";
type MedssiIconVariant = "dark" | "light";

interface MedssiIconProps {
	size?: MedssiIconSize;
	variant?: MedssiIconVariant;
	className?: string;
}

const sizeMap: Record<MedssiIconSize, { box: string; icon: LucideProps["size"] }> = {
	sm: { box: "size-7 rounded-md", icon: 14 },
	md: { box: "size-8 rounded-lg", icon: 16 },
	lg: { box: "size-10 rounded-xl", icon: 20 },
};

const variantMap: Record<MedssiIconVariant, { box: string; icon: string }> = {
	dark: { box: "bg-foreground", icon: "text-background" },
	light: { box: "bg-background", icon: "text-foreground" },
};

export const MedssiIcon = ({
	size = "md",
	variant = "dark",
	className,
}: MedssiIconProps) => {
	const s = sizeMap[size];
	const v = variantMap[variant];

	return (
		<div
			role="img"
			aria-label="Medssi"
			className={cn(
				"flex items-center justify-center shrink-0",
				s.box,
				v.box,
				className,
			)}
		>
			<HeartPulseIcon size={s.icon} className={v.icon} aria-hidden="true" />
		</div>
	);
};
