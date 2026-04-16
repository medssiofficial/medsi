import { ShieldIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type AdminLogoVariant = "light" | "sidebar";
type AdminLogoSize = "sm" | "md" | "lg";

interface AdminLogoProps {
	variant?: AdminLogoVariant;
	size?: AdminLogoSize;
	showText?: boolean;
	className?: string;
}

const sizeConfig: Record<AdminLogoSize, { icon: number; text: string }> = {
	sm: { icon: 18, text: "text-sm" },
	md: { icon: 22, text: "text-base" },
	lg: { icon: 26, text: "text-lg" },
};

const variantConfig: Record<AdminLogoVariant, { icon: string; text: string }> = {
	sidebar: {
		icon: "text-sidebar-foreground",
		text: "text-sidebar-foreground",
	},
	light: {
		icon: "text-foreground",
		text: "text-foreground",
	},
};

export const AdminLogo = ({
	variant = "light",
	size = "md",
	showText = true,
	className,
}: AdminLogoProps) => {
	const s = sizeConfig[size];
	const v = variantConfig[variant];

	return (
		<div
			className={cn("flex items-center gap-2", className)}
			{...(!showText ? { role: "img", "aria-label": "Medssi Admin" } : {})}
		>
			<ShieldIcon size={s.icon} className={v.icon} aria-hidden="true" />
			{showText && (
				<span
					className={cn(
						"font-heading font-bold whitespace-nowrap",
						s.text,
						v.text,
					)}
				>
					Medssi Admin
				</span>
			)}
		</div>
	);
};
