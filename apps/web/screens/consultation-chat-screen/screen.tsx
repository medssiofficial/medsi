"use client";

import {
	ConsultationChatDisclaimer,
	ConsultationChatHeader,
	ConsultationChatInput,
	ConsultationChatMessages,
	ConsultationChatProgress,
} from "./components";
import { useConsultationChatScreen } from "./hook";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

const ConsultationChatScreen = () => {
	const hook = useConsultationChatScreen();

	if (hook.isInitializing) {
		return (
			<div className="flex min-h-svh w-full flex-col items-center justify-center bg-neutral-warm">
				<Skeleton className="h-8 w-48" />
				<p className="mt-4 text-sm text-font-secondary">
					Setting up your consultation...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-svh w-full bg-neutral-warm">
			<div className="flex min-h-svh w-full flex-col">
				<header className="sticky top-0 z-30 w-full shrink-0 border-b border-border-subtle bg-neutral-warm/95 backdrop-blur supports-backdrop-filter:bg-neutral-warm/85">
					<div className="flex h-14 w-full items-stretch px-4 md:px-6">
						<ConsultationChatHeader onBack={hook.handleBack} />
					</div>
					{hook.caseStatus === "in_progress" && <ConsultationChatProgress />}
				</header>

				<main className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col px-4 pb-4 pt-6 md:px-6">
					<ConsultationChatDisclaimer />
					<ConsultationChatMessages
						messages={hook.messages}
						messagesEndRef={hook.messagesEndRef}
					/>

					{hook.caseStatus === "completed" && (
						<div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
							<p className="text-sm font-medium text-green-800">
								Consultation complete. Your case is being processed.
							</p>
						</div>
					)}

					{hook.caseStatus === "cancelled" && (
						<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
							<p className="text-sm font-medium text-red-800">
								This consultation has been closed.
							</p>
						</div>
					)}

					<ConsultationChatInput
						inputText={hook.inputText}
						onInputChange={hook.setInputText}
						onSend={hook.handleSendMessage}
						onSkip={hook.handleSkipQuestion}
						onAttach={() => hook.setShowFilePicker(true)}
						onMic={hook.handleToggleRecording}
						isRecording={hook.isRecording}
						isSending={hook.isSending}
						disabled={hook.isChatDisabled}
						currentQuestion={hook.currentQuestion}
						showFilePicker={hook.showFilePicker}
						onCloseFilePicker={() => hook.setShowFilePicker(false)}
						onFileUpload={hook.handleAttachFile}
						onSelectExistingFile={hook.handleSelectExistingFile}
					/>
				</main>
			</div>
		</div>
	);
};

export default ConsultationChatScreen;
