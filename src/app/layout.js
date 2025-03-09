import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav/Navbar";
import StoreProvider from "@/components/providers/StoreProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { makeStore } from "@/store/store";
import { setEnrolledCourses, setUserData } from "@/store/slices/authSlice";
import { setTheme } from "@/store/slices/themeSlice";
import { setCartData } from "@/store/slices/cartSlice";
import getThemeCookie from "@/utils/getThemeCookie.mjs";
import checkToken from "@/utils/checkToken.mjs";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";
import getCartItemsFromDb from "@/components/cart/functions/getCartItemsFromDb.mjs";
import getEnrolledCourses from "@/utils/getEnrolledCourses.mjs";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import sukunLifeImage from "@/../public/images/sukunlife.jpg";
import capitalize from "@/utils/capitalize.mjs";
import TokenRefresh from "@/components/providers/TokenRefresh";

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
      'book appointment',
      "ruqyah session"
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
  // Initialize store and fetch initial data
  const store = makeStore();
  const refreshToken = await checkToken();
  const storedTheme = await getThemeCookie();
  const userData = await getUserDataFromToken();
console.log(userData)
  // Dispatch initial state
  store.dispatch(setUserData(userData || null));
  store.dispatch(setTheme(storedTheme || "light")); // Default to light if undefined

  // Fetch user-specific data if authenticated
  if (userData?._id) {
    const [cartItems, courses] = await Promise.all([
      getCartItemsFromDb(userData._id),
      getEnrolledCourses(userData._id),
    ]);

    store.dispatch(setCartData(cartItems?.cart?.cart || []));
    store.dispatch(setEnrolledCourses(courses?.courses?.enrolledCourses || []));
  }

  const initialReduxState = store.getState();

  return (
    <html
      lang="en"
      data-theme={storedTheme || "light"}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
      >
        <StoreProvider initialReduxState={initialReduxState}>
          <TokenRefresh refreshToken={refreshToken}>
            <ThemeProvider>
              <Navbar />
              {children}
            </ThemeProvider>
          </TokenRefresh>
        </StoreProvider>
      </body>
    </html>
  );
}
