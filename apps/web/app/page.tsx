import { Button } from "@repo/ui/components/ui/button";

export default function Page() {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
			<h1 className="text-2xl font-semibold">Hello</h1>
			<Button type="button">ShadCN button</Button>
		</main>
	);
}
