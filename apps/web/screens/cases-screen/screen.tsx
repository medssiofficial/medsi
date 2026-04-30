"use client";

import { PatientAppShell } from "@/components/common";
import { CasesContent } from "./components";
import { useCasesScreen } from "./hook";

const CasesScreen = () => {
	const {
		searchInput,
		setSearchInput,
		items,
		setSentinelRef,
		hasNextPage,
		isLoading,
		isFetchingNextPage,
		handleLoadMore,
		handleStartConsultation,
	} = useCasesScreen();

	return (
		<PatientAppShell title="Cases">
			<CasesContent
				searchInput={searchInput}
				onSearchInputChange={setSearchInput}
				items={items}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				onLoadMore={handleLoadMore}
				onStartConsultation={handleStartConsultation}
				setSentinelRef={setSentinelRef}
			/>
		</PatientAppShell>
	);
};

export default CasesScreen;
