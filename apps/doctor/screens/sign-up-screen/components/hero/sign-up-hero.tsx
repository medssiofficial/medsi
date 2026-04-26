import { SIGN_UP_HERO_POINTERS } from "@/config/client-constants";
import { CheckCircle2 } from "lucide-react";

const SignUpHero = () => {
	return (
		<div className="h-screen bg-primary text-primary-foreground w-1/2 xl:flex hidden flex-col px-7 py-8 gap-8 font-sans">
			<div className="w-full flex flex-col max-w-140 gap-8">
				<h1 className="w-full font-heading text-4xl font-bold">
					Join Medssi as a Medical Professional
				</h1>
				<p className="w-full text-muted-foreground">
					Connect with patients worldwide and provide expert medical
					consultations through our secure platform.
				</p>

				<div className="w-full flex flex-col gap-4">
					{SIGN_UP_HERO_POINTERS.map((pointer, index) => (
						<div
							key={index}
							className="w-full flex items-center gap-3"
						>
							<CheckCircle2 className="size-5" />
							{pointer}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SignUpHero;
