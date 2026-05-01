"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useFilesSubTabs } from "./hook";

interface FilesSubTabsProps {
	value: "doctors" | "patients";
	onValueChange: (value: "doctors" | "patients") => void;
}

export const FilesSubTabs = (props: FilesSubTabsProps) => {
	const { value, onValueChange } = props;
	useFilesSubTabs();

	return (
		<Tabs
			value={value}
			onValueChange={(next) => onValueChange(next as "doctors" | "patients")}
		>
			<TabsList variant="line" className="w-fit">
				<TabsTrigger value="doctors">Doctors</TabsTrigger>
				<TabsTrigger value="patients">Patients</TabsTrigger>
			</TabsList>
		</Tabs>
	);
};
