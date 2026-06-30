import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./global.css";
import { Providers } from "./providers";

const exo2 = Exo_2({
	subsets: ["latin"],
	variable: "--font-exo2",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: "Vendly",
	description: "Your storefront, simplified.",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/logo.png",
	},
	openGraph: {
		title: "Vendly",
		description: "Your storefront, simplified.",
		images: [{ url: "/logo.png", width: 512, height: 512 }],
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={exo2.variable}>
			<head>
				<link
					rel="stylesheet"
					href="/fontawesome/releases/v6.3.0/css/pro.min.css?token=2c15cc0cc7"
				/>
			</head>
			<body>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
