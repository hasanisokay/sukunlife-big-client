import {
  Geist,
  Geist_Mono,
  Montserrat,
  Sacramento,
  Charis_SIL,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav/Navbar";
import StoreProvider from "@/components/providers/StoreProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import sukunLifeImage from "@/../public/images/sukunlife.jpg";
import capitalize from "@/utils/capitalize.mjs";
import TokenRefresh from "@/components/providers/TokenRefresh";
import Footer from "@/components/shared/Footer";
import ClientBootstrap from "@/components/providers/ClientBootstrap";
import { headers } from "next/headers";

// Font configurations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});
const charisSIL = Charis_SIL({
  variable: "--font-charisSIL",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});
const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

// Metadata configuration
export async function generateMetadata() {
  const host = await hostname();
  const metaImage = `${host}${sukunLifeImage.src}`;
  const capitalizedName = capitalize(websiteName);

  return {
    title: {
      default: capitalizedName,
      template: `%s - ${capitalizedName}`,
    },
    description:
      "Empower your learning journey with SukunLife - Your gateway to personal growth and knowledge.", // Add your site description
    metadataBase: new URL(host),
    alternates: {
      canonical: host,
    },
    openGraph: {
      title: capitalizedName,
      description: "Empower your learning journey with SukunLife",
      url: host,
      siteName: capitalizedName,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: `${capitalizedName} Banner`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: capitalizedName,
      description: "Empower your learning journey with SukunLife",
      images: [metaImage],
      // creator: "@sukunlife",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "./../../public/favicon.ico",
      shortcut: "./../../public/favicon-16x16.png",
      apple: "./../../public/apple-touch-icon.png",
    },
    authors: [{ name: "SukunLife Team" }],
    keywords: [
      "sukunlife",
      "learning",
      "education",
      "courses",
      "personal growth",
      "online learning",
      "live ruqyah",
      "ruqyah support",
      "book appointment",
      "ruqyah session",
    ],
    // viewport: {
    //   width: "device-width",
    //   initialScale: 1,
    //   maximumScale: 1,
    // },
    // verification: {
    //   google: "google-verification-code",
    // },
  };
}

export default async function RootLayout({ children }) {
  const headersList = headers();
  const theme = headersList.get("x-theme") || "light";

  return (
    <html
      lang="en"
      data-theme={theme}
      className={theme === "dark" ? "dark" : ""}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable}  ${sacramento.variable}  ${charisSIL.variable} antialiased`}
      >
        <StoreProvider>
          <ClientBootstrap>
            <TokenRefresh>
              <ThemeProvider>
                <Navbar />
                <div className="min-h-[calc(100vh-110px)]">{children}</div>
                <Footer />
              </ThemeProvider>
            </TokenRefresh>
          </ClientBootstrap>
        </StoreProvider>
      </body>
    </html>
  );
}
