"use client";

import { PatientAppShell } from "@/components/common";
import { FilesContent } from "./components";
import { useFilesScreen } from "./hook";

const FilesScreen = () => {
	const {
		searchInput,
		setSearchInput,
		items,
		setSentinelRef,
		hasNextPage,
		isLoading,
		isFetchingNextPage,
		handleLoadMore,
	} = useFilesScreen();

	return (
		<PatientAppShell title="Files">
			<FilesContent
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

export default FilesScreen;
