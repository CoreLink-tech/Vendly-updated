import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Exo_2, Fraunces } from "next/font/google";
import "./global.css";
import { Providers } from "./providers";
import { ColorSchemeSync } from "@/components/ColorSchemeSync";

const exo2 = Exo_2({
	subsets: ["latin"],
	variable: "--font-exo2",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
	subsets: ["latin"],
	variable: "--font-fraunces",
	display: "swap",
	weight: "variable",
	style: ["normal", "italic"],
	axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://vendlyapp.com.ng"),
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
		url: "https://vendlyapp.com.ng",
		siteName: "Vendly",
		images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vendly — Your storefront, simplified." }],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Vendly",
		description: "Your storefront, simplified.",
		images: ["/og-image.png"],
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`${exo2.variable} ${fraunces.variable}`} suppressHydrationWarning>
			<head>
				<meta name="color-scheme" content="light dark" />
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var k='vendly-color-scheme';var s=null;try{s=localStorage.getItem(k)}catch(e){}var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');r.style.colorScheme='dark'}else{r.classList.remove('dark');r.style.colorScheme='light'}}catch(e){}})();`,
					}}
				/>
				<link
					rel="stylesheet"
					href="/fontawesome/releases/v6.3.0/css/pro.min.css?token=2c15cc0cc7"
				/>
			</head>
			<body>
				<ColorSchemeSync />
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
