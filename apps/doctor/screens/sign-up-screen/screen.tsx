import { SignUpHero, SignUpSection } from "./components";

const SignUpScreen = () => {
	return (
		<main className="w-full min-h-screen flex bg-background text-foreground font-sans">
			<SignUpHero />
			<SignUpSection />
		</main>
	);
};

export default SignUpScreen;
