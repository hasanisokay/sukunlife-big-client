import LoginForm from "@/components/forms/LoginForm";
import { websiteName } from "@/constants/names.mjs";
import loginCover from "@/../public/images/login.jpg";
import hostname from "@/constants/hostname.mjs";

const loginPage = async({searchParams}) => {
    const redirectTo = (await searchParams)?.redirectTo || "/";
    return <LoginForm redirectTo={redirectTo}/>
};

export default loginPage;


export async function generateMetadata() {
  try {
    const host = await hostname();
    const loginCoverUrl = `${host}${loginCover.src}`;

    const metadata = {
      title: `Log In | Access Your Account`,
      description:
        "Log in to Sukunlife to access your account and continue learning!",
      keywords: [
        "sukunlife login",
        "log in",
        "account access",
        "online login",
        "sukunlife account",
        "sign in",
      ],
      alternates: {
        canonical: `${host}/login`,
      },
      openGraph: {
        title: `Log In - ${websiteName}`,
        description:
          "Access your Sukunlife account. Log in now to explore!",
        url: `${host}/login`,
        siteName: websiteName,
        images: [
          {
            url: loginCoverUrl,
            width: 1200, // Optimized for social sharing
            height: 630,
            alt: `${websiteName} Login Page`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Log In - ${websiteName}`,
        description:
          "Log in to your Sukunlife account now!",
        images: [loginCoverUrl],
      },
      robots: "noindex", // Optional: prevents indexing of login page
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Login metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Log In - ${websiteName}`,
      description: "Access your Sukunlife account.",
      alternates: {
        canonical: `${host}/login`,
      },
    };
  }
}