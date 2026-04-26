import { OnboardForm, OnboardHeader } from "./components";

const OnboardScreen = () => {
	return (
		<main className="min-h-screen w-full bg-background text-foreground font-sans">
			<OnboardHeader />
			<OnboardForm />
		</main>
	);
};

export default OnboardScreen;
