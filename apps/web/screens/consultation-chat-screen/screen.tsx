"use client";

import {
	ConsultationChatDisclaimer,
	ConsultationChatHeader,
	ConsultationChatInput,
	ConsultationChatMessages,
	ConsultationChatProgress,
} from "./components";
import { useConsultationChatScreen } from "./hook";

const ConsultationChatScreen = () => {
	const { handleBack, handlePlaceholderAction } = useConsultationChatScreen();

	return (
		<div className="flex min-h-svh w-full flex-col bg-neutral-warm">
			<header className="sticky top-0 z-30 w-full shrink-0 border-b border-border-subtle bg-neutral-warm/95 backdrop-blur supports-backdrop-filter:bg-neutral-warm/85">
				<div className="flex h-14 w-full items-stretch px-4 md:px-6">
					<ConsultationChatHeader onBack={handleBack} />
				</div>
				<ConsultationChatProgress />
			</header>

			<main className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col px-4 pb-10 pt-6 md:px-6">
				<ConsultationChatDisclaimer />
				<ConsultationChatMessages />
				<ConsultationChatInput
					onAttach={() => handlePlaceholderAction("Attachments")}
					onMic={() => handlePlaceholderAction("Voice input")}
					onSend={() => handlePlaceholderAction("Send message")}
				/>
			</main>
		</div>
	);
};

export default ConsultationChatScreen;
