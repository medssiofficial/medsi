import { cn } from "../../lib/utils";

interface Props {
	className?: string;
}

export const ClientLogo = ({ className }: Props) => {
	return (
		<div className={cn("flex items-center gap-2 font-sans", className)}>
			<span className="text-lg">Medssi</span>
		</div>
	);
};
