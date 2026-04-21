import { LoginHero } from "./components/hero";

const LoginScreen = () => {
	return (
		<main className="w-full min-h-screen flex bg-background text-foreground font-sans">
			<LoginHero />
		</main>
	);
};

export default LoginScreen;
