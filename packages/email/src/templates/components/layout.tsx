import type { CSSProperties, ReactNode } from "react";

const styles: Record<string, CSSProperties> = {
	body: {
		margin: 0,
		padding: 0,
		backgroundColor: "#F0F2F5",
		fontFamily: "Manrope, Arial, sans-serif",
		color: "#0B1119",
	},
	container: {
		maxWidth: "600px",
		margin: "0 auto",
		padding: "24px 16px",
	},
	card: {
		backgroundColor: "#ffffff",
		border: "1px solid #E2E6EC",
		borderRadius: "14px",
		padding: "24px",
	},
	logo: {
		fontFamily: "Space Grotesk, Manrope, Arial, sans-serif",
		fontSize: "20px",
		fontWeight: 700,
		margin: "0 0 16px 0",
		color: "#0F6E6E",
	},
	title: {
		fontFamily: "Space Grotesk, Manrope, Arial, sans-serif",
		fontSize: "22px",
		fontWeight: 700,
		margin: "0 0 10px 0",
	},
	text: {
		fontSize: "14px",
		lineHeight: 1.6,
		margin: "0 0 12px 0",
		color: "#3D4654",
	},
	footer: {
		fontSize: "12px",
		lineHeight: 1.4,
		color: "#8B95A4",
		marginTop: "18px",
	},
	cta: {
		display: "inline-block",
		backgroundColor: "#0F6E6E",
		color: "#ffffff",
		padding: "10px 14px",
		borderRadius: "10px",
		textDecoration: "none",
		fontSize: "13px",
		fontWeight: 600,
		marginTop: "8px",
	},
};

interface EmailLayoutProps {
	title: string;
	previewText?: string;
	children: ReactNode;
	cta?: {
		label: string;
		href: string;
	};
}

export const EmailLayout = (props: EmailLayoutProps) => {
	const { title, previewText, children, cta } = props;

	return (
		<html>
			<body style={styles.body}>
				{previewText ? <div style={{ display: "none" }}>{previewText}</div> : null}
				<div style={styles.container}>
					<div style={styles.card}>
						<p style={styles.logo}>Medssi</p>
						<h1 style={styles.title}>{title}</h1>
						<div>{children}</div>
						{cta ? (
							<a href={cta.href} style={styles.cta}>
								{cta.label}
							</a>
						) : null}
						<p style={styles.footer}>
							This is an automated email from Medssi. Please do not reply to this
							message.
						</p>
					</div>
				</div>
			</body>
		</html>
	);
};

export const EmailText = (props: { children: ReactNode }) => {
	return <p style={styles.text}>{props.children}</p>;
};
