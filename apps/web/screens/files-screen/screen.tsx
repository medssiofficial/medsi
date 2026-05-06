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
		onProcessFile,
		onBulkProcess,
		isBulkProcessing,
		isProcessingFile,
		eligibleBulkCount,
		viewMode,
		setViewMode,
		onDeleteFile,
		isDeletingFile,
		activePreviewFile,
		setActivePreviewFile,
		onOpenPreview,
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
					onProcessFile={onProcessFile}
					onBulkProcess={onBulkProcess}
					isBulkProcessing={isBulkProcessing}
					isProcessingFile={isProcessingFile}
					eligibleBulkCount={eligibleBulkCount}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					onDeleteFile={onDeleteFile}
					isDeletingFile={isDeletingFile}
					activePreviewFile={activePreviewFile}
					onOpenPreview={onOpenPreview}
					onPreviewOpenChange={(open) => {
						if (!open) setActivePreviewFile(null);
					}}
				/>
			</div>
		</PatientAppShell>
	);
};

export default FilesScreen;
