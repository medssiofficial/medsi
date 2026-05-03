import type { DoctorEmbeddingSource } from "@repo/database/actions/doctor";

function buildLocationLine(
	profile: NonNullable<DoctorEmbeddingSource["profile"]>,
): string {
	const cityCountyCountry = [profile.city, profile.county, profile.country]
		.map((s) => s?.trim())
		.filter((s): s is string => Boolean(s && s.length > 0))
		.join(", ");

	const address = profile.address_line_1?.trim();
	if (address) {
		return cityCountyCountry ? `${cityCountyCountry}, ${address}` : address;
	}

	return cityCountyCountry;
}

/**
 * Stable, human-readable document for embedding (experience, location, specs).
 */
export function buildDoctorEmbeddingText(row: DoctorEmbeddingSource): string {
	const profile = row.profile;
	if (!profile) {
		throw new Error("Doctor profile is required to build embedding text");
	}

	const yearsInPractice =
		profile.years_in_practice === null || profile.years_in_practice === undefined
			? "Not specified"
			: String(profile.years_in_practice);

	const specs = row.specializations.map((s) => s.name.trim()).filter(Boolean);
	const specBlock =
		specs.length > 0
			? specs.map((name) => `- ${name}`).join("\n")
			: "- None listed";

	const experienceBlock = row.experiences.length
		? row.experiences
				.map((exp, i) => {
					const start = exp.start_date.toISOString().slice(0, 10);
					const end = exp.end_date.toISOString().slice(0, 10);
					return [
						`Experience ${i + 1} (${start} to ${end})`,
						`Hospital: ${exp.hospital_name.trim()}`,
						exp.description.trim(),
					].join("\n");
				})
				.join("\n\n")
		: "No structured experience entries.";

	return [
		"Doctor professional profile (structured for search)",
		"",
		`Years of experience (declared): ${profile.years_of_experience.toString()}`,
		`Years in practice: ${yearsInPractice}`,
		`Location: ${buildLocationLine(profile)}`,
		"",
		"Specializations:",
		specBlock,
		"",
		"Experience history:",
		experienceBlock,
	].join("\n");
}
