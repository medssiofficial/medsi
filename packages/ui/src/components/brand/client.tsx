import { cn } from "../../lib/utils";
import { MedssiIcon } from "./medssi-icon";

type ClientLogoSize = "sm" | "md" | "lg";
type ClientLogoVariant = "dark" | "light";

interface ClientLogoProps {
	size?: ClientLogoSize;
	variant?: ClientLogoVariant;
	showText?: boolean;
	className?: string;
}

const sizeConfig: Record<ClientLogoSize, { icon: "sm" | "md" | "lg"; text: string }> = {
	sm: { icon: "sm", text: "text-base" },
	md: { icon: "md", text: "text-lg" },
	lg: { icon: "lg", text: "text-xl" },
};

export const ClientLogo = ({
	size = "md",
	variant = "dark",
	showText = true,
	className,
}: ClientLogoProps) => {
	const s = sizeConfig[size];

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<MedssiIcon size={s.icon} variant={variant} />
			{showText && (
				<span
					className={cn(
						"font-heading font-bold text-foreground",
						s.text,
					)}
				>
					Medssi
				</span>
			)}
		</div>
	);
};
