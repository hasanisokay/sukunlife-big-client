import SignUpForm from "@/components/forms/SignUpForm";
import signupCover from "@/../public/images/signup.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

const signUpPage = () => {
  return <SignUpForm />;
};

export default signUpPage;


export async function generateMetadata() {
  try {
    const host = await hostname();
    const signupCoverUrl = `${host}${signupCover.src}`;

    const metadata = {
      title: `Sign Up | Join Now`,
      description:
        "Sign up for Sukunlife to create your account and start learning today!",
      keywords: [
        "sukunlife signup",
        "create account",
        "join sukunlife",
        "register online",
        "signup page",
        "online learning",
      ],
      alternates: {
        canonical: `${host}/signup`,
      },
      openGraph: {
        title: `Sign Up - ${websiteName}`,
        description:
          "Join Sukunlife today! Sign up to access courses and more.",
        url: `${host}/signup`,
        siteName: websiteName,
        images: [
          {
            url: signupCoverUrl,
            width: 1200, 
            height: 630,
            alt: `${websiteName} Sign Up Page`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Sign Up - ${websiteName}`,
        description:
          "Create your Sukunlife account now and start exploring!",
        images: [signupCoverUrl],
      },
      robots: "noindex", 
    };

    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Signup metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Sign Up - ${websiteName}`,
      description: "Join Sukunlife by creating your account.",
      alternates: {
        canonical: `${host}/signup`,
      },
    };
  }
}