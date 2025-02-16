import IdentityForm from "@/components/forms/IdentityForm";
import { websiteName } from "@/constants/names.mjs";
import identityCover from "@/../public/images/identity.jpg";
import hostname from "@/constants/hostname.mjs";

const identityPage = async() => {
    return <IdentityForm />
};

export default identityPage;

export async function generateMetadata() {
    const host = await hostname();
    const identityCoverImage = `${host}${identityCover.src}`;
  
    const metadata = {
      title: `Identity - ${websiteName}`,
      description: "Reset your password to access your account.",
      keywords: ["password, reset"],
      url: `${host}/identity`,
      canonical: `${host}/identity`,
      openGraph: {
        title: `Identity - ${websiteName}`,
        description: "Reset your password to access your account.",
        url: `${host}/identity`,
        images: [
          {
            url: identityCoverImage,
            width: 800,
            height: 600,
            alt: 'Login Cover Image',
          },
        ],
        siteName: websiteName,
        locale: 'bn_BD',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Identity - ${websiteName}`,
        description: "Reset your password to access your account.",
        images: [identityCoverImage],
      },
    };
    return metadata;
  }