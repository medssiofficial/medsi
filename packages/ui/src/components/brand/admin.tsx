import { cn } from "../../lib/utils";

interface Props {
	className?: string;
}

export const AdminLogo = ({ className }: Props) => {
	return (
		<div className={cn("flex items-center gap-2 font-sans", className)}>
			<span className="text-lg">Admin</span>
		</div>
	);
};
