"use client";

import { PatientAppShell } from "@/components/common";
import { ChatContent } from "./components";
import { useChatScreen } from "./hook";

const ChatScreen = () => {
	const {
		searchInput,
		setSearchInput,
		items,
		setSentinelRef,
		hasNextPage,
		isLoading,
		isFetchingNextPage,
		handleLoadMore,
	} = useChatScreen();

	return (
		<PatientAppShell title="Chat">
			<ChatContent
				searchInput={searchInput}
				onSearchInputChange={setSearchInput}
				items={items}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				onLoadMore={handleLoadMore}
				setSentinelRef={setSentinelRef}
			/>
		</PatientAppShell>
	);
};

export default ChatScreen;
