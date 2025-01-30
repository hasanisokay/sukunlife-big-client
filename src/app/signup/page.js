import SignUpForm from "@/components/forms/SignUpForm";
import signupCover from "@/../public/images/blog.jpg";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";

const signUpPage = () => {
  return <SignUpForm />;
};

export default signUpPage;

export async function generateMetadata() {
  const host = await hostname();
  const signupCoverUrl = `${host}${signupCover.src}`;

  const metadata = {
    title: `Signup - ${websiteName}`,
    description: "Signup to create your account.",
    keywords: ["signup"],
    url: `${host}/signup`,
    canonical: `${host}/signup`,
    openGraph: {
      title: `Signup - ${websiteName}`,
      description: "Signup to create your account.",
      url: `${host}/signup`,
      images: [
        {
          url: signupCoverUrl,
          width: 800,
          height: 600,
          alt: "Signup Cover Image",
        },
      ],
      siteName: websiteName,
      locale: "bn_BD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Signup - ${websiteName}`,
      description: "Signup to create your account.",
      images: [signupCoverUrl],
    },
  };
  return metadata;
}
