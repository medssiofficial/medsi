"use client";

import { PatientAppShell } from "@/components/common";
import { FilesContent, FilesUpload } from "./components";
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
		handleUploadFile,
		isUploading,
	} = useFilesScreen();

	return (
		<PatientAppShell title="Files">
			<div className="space-y-4">
				<FilesUpload
					isUploading={isUploading}
					onUploadFile={(file) => void handleUploadFile(file)}
				/>
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
			</div>
		</PatientAppShell>
	);
};

export default FilesScreen;
