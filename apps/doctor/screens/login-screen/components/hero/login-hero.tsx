const LoginHero = () => {
	return (
		<div className="h-screen bg-primary text-primary-foreground w-1/2 xl:flex hidden flex-col justify-center px-7 py-4 gap-4 font-sans">
			<div className="w-full flex flex-col max-w-142 gap-8">
				<h1 className="font-heading 2xl:text-3xl text-2xl font-bold">
					Medssi
				</h1>
				<p className="text-muted-foreground 2xl:text-lg text-base">
					Doctor Portal
				</p>
				<p className="text-muted-foreground font-semibold 2xl:text-4xl text-3xl font-heading">
					Conneting medical expertise with patients worldwide
				</p>
			</div>
		</div>
	);
};

export default LoginHero;
