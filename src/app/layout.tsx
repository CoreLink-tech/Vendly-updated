import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./global.css";
import { Providers } from "./providers";

const bebasNeue = Bebas_Neue({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-bebas",
	display: "swap",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Vendly",
	description: "Your storefront, simplified.",
	icons: {
		icon: "/favicon.png",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
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
