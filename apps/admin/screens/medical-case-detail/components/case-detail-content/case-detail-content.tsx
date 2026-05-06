"use client";

import type { MedicalCaseDetail } from "@/services/api/admin/medical-cases/get-medical-case-detail";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
	Activity,
	Bot,
	ChevronDown,
	FileText,
	MessageSquare,
	Sparkles,
	User,
} from "lucide-react";
import { useState } from "react";
import { useCaseDetailContent } from "./hook";

interface CaseDetailContentProps {
	medicalCase: MedicalCaseDetail;
}

export const CaseDetailContent = (props: CaseDetailContentProps) => {
	const {
		medicalCase,
		formatDate,
		formatShortDate,
		getStageBadgeClasses,
		getStatusBadgeClasses,
		getProcessingStatusClasses,
		formatLabel,
	} = useCaseDetailContent({ medicalCase: props.medicalCase });

	return (
		<div className="space-y-6">
			<CaseOverviewCard
				medicalCase={medicalCase}
				formatDate={formatDate}
				getStageBadgeClasses={getStageBadgeClasses}
				getStatusBadgeClasses={getStatusBadgeClasses}
				formatLabel={formatLabel}
			/>

			{medicalCase.analysis && (
				<AnalysisCard
					analysis={medicalCase.analysis}
					formatDate={formatDate}
				/>
			)}

			<ChatTranscriptCard
				messages={medicalCase.chat_messages}
				formatShortDate={formatShortDate}
			/>

			<FilesCard
				files={medicalCase.files}
				formatDate={formatDate}
				getProcessingStatusClasses={getProcessingStatusClasses}
				formatLabel={formatLabel}
			/>

			<EventLogCard
				events={medicalCase.event_logs}
				formatShortDate={formatShortDate}
				formatLabel={formatLabel}
			/>
		</div>
	);
};

function CaseOverviewCard(props: {
	medicalCase: MedicalCaseDetail;
	formatDate: (v: Date | string) => string;
	getStageBadgeClasses: (s: string) => string;
	getStatusBadgeClasses: (s: string) => string;
	formatLabel: (s: string) => string;
}) {
	const {
		medicalCase,
		formatDate,
		getStageBadgeClasses,
		getStatusBadgeClasses,
		formatLabel,
	} = props;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Case Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Stage</p>
						<Badge
							variant="secondary"
							className={`rounded-full font-medium ${getStageBadgeClasses(medicalCase.case_stage)}`}
						>
							{formatLabel(medicalCase.case_stage)}
						</Badge>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Status</p>
						<Badge
							variant="secondary"
							className={`rounded-full font-medium ${getStatusBadgeClasses(medicalCase.conversation_status)}`}
						>
							{formatLabel(medicalCase.conversation_status)}
						</Badge>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Language</p>
						<p className="text-sm font-medium">{medicalCase.language || "—"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Created</p>
						<p className="text-sm font-medium">
							{formatDate(medicalCase.created_at)}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Patient Name</p>
						<p className="text-sm font-medium">
							{medicalCase.user?.profile?.name ?? "—"}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Patient Email</p>
						<p className="text-sm font-medium">
							{medicalCase.user?.profile?.email ?? "—"}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function AnalysisCard(props: {
	analysis: NonNullable<MedicalCaseDetail["analysis"]>;
	formatDate: (v: Date | string) => string;
}) {
	const { analysis } = props;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Sparkles className="size-5 text-amber-500" />
					AI Analysis
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Detected Specialty</p>
						<p className="text-sm font-medium">
							{analysis.detected_specialty ?? "—"}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Urgency Level</p>
						<p className="text-sm font-medium">
							{analysis.urgency_level ?? "—"}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">AI Confidence</p>
						<p className="text-sm font-medium">
							{analysis.ai_confidence != null
								? `${Math.round(analysis.ai_confidence * 100)}%`
								: "—"}
						</p>
					</div>
				</div>

				{analysis.key_symptoms && analysis.key_symptoms.length > 0 && (
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Key Symptoms</p>
						<div className="flex flex-wrap gap-2">
							{analysis.key_symptoms.map((symptom, index) => {
								const isObjectSymptom =
									typeof symptom === "object" && symptom !== null;
								const symptomRecord = isObjectSymptom
									? (symptom as Record<string, unknown>)
									: null;
								const description = symptomRecord?.description;
								const severity = symptomRecord?.severity;
								const label =
									typeof description === "string" && description.trim().length > 0
										? description
										: typeof symptom === "string"
											? symptom
											: JSON.stringify(symptom);

								return (
									<Badge key={index} variant="outline" className="rounded-full">
										{label}
										{typeof severity === "string" && severity.trim().length > 0
											? ` (${severity})`
											: ""}
									</Badge>
								);
							})}
						</div>
					</div>
				)}

				{analysis.summary && (
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Summary</p>
						<p className="text-sm leading-relaxed">{analysis.summary}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ChatTranscriptCard(props: {
	messages: MedicalCaseDetail["chat_messages"];
	formatShortDate: (v: Date | string) => string;
}) {
	const { messages, formatShortDate } = props;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<MessageSquare className="size-5" />
					Chat Transcript ({messages.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				{messages.length === 0 ? (
					<p className="text-sm text-muted-foreground">No messages yet.</p>
				) : (
					<div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex gap-3 rounded-lg p-3 ${
									message.role === "assistant"
										? "bg-muted/50"
										: "bg-blue-50 dark:bg-blue-950/30"
								}`}
							>
								<div className="shrink-0 pt-0.5">
									{message.role === "assistant" ? (
										<Bot className="size-4 text-muted-foreground" />
									) : (
										<User className="size-4 text-blue-600 dark:text-blue-400" />
									)}
								</div>
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<span className="text-xs font-medium capitalize">
											{message.role}
										</span>
										<span className="text-xs text-muted-foreground">
											{formatShortDate(message.created_at)}
										</span>
									</div>
									<p className="whitespace-pre-wrap text-sm">
										{message.content}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function FilesCard(props: {
	files: MedicalCaseDetail["files"];
	formatDate: (v: Date | string) => string;
	getProcessingStatusClasses: (s: string) => string;
	formatLabel: (s: string) => string;
}) {
	const { files, formatDate, getProcessingStatusClasses, formatLabel } = props;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<FileText className="size-5" />
					Attached Files ({files.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				{files.length === 0 ? (
					<p className="text-sm text-muted-foreground">No files attached.</p>
				) : (
					<div className="space-y-2">
						{files.map((file) => (
							<div
								key={file.id}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="min-w-0 flex-1 space-y-0.5">
									<p className="truncate text-sm font-medium">
										{file.file_name}
									</p>
									<p className="text-xs text-muted-foreground">
										{file.file_type} &middot; {formatDate(file.created_at)}
									</p>
								</div>
								<Badge
									variant="secondary"
									className={`ml-3 rounded-full text-xs font-medium ${getProcessingStatusClasses(file.processing_status)}`}
								>
									{formatLabel(file.processing_status)}
								</Badge>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function EventLogCard(props: {
	events: MedicalCaseDetail["event_logs"];
	formatShortDate: (v: Date | string) => string;
	formatLabel: (s: string) => string;
}) {
	const { events, formatShortDate, formatLabel } = props;
	const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

	const toggleEvent = (id: string) => {
		setExpandedEvents((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Activity className="size-5" />
					Event Log ({events.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				{events.length === 0 ? (
					<p className="text-sm text-muted-foreground">No events recorded.</p>
				) : (
					<div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
						{events.map((event) => (
							<Collapsible
								key={event.id}
								open={expandedEvents.has(event.id)}
								onOpenChange={() => toggleEvent(event.id)}
							>
								<CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50">
									<div className="flex items-center gap-3">
										<div className="size-2 rounded-full bg-muted-foreground" />
										<span className="text-sm font-medium">
											{formatLabel(event.event_type)}
										</span>
										<span className="text-xs text-muted-foreground">
											{formatShortDate(event.created_at)}
										</span>
									</div>
									{event.metadata && (
										<ChevronDown className="size-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
									)}
								</CollapsibleTrigger>
								{event.metadata && (
									<CollapsibleContent>
										<div className="ml-5 mt-1 rounded-md bg-muted/30 p-3">
											<pre className="overflow-x-auto text-xs">
												{JSON.stringify(event.metadata, null, 2)}
											</pre>
										</div>
									</CollapsibleContent>
								)}
							</Collapsible>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
