import { LoginHero, LoginSection } from "./components";

const LoginScreen = () => {
	return (
		<main className="w-full min-h-screen flex bg-background text-foreground font-sans">
			<LoginHero />
			<LoginSection />
		</main>
	);
};

export default LoginScreen;
