import LoginForm from "@/components/forms/LoginForm";
import { websiteName } from "@/constants/names.mjs";
import loginCover from "@/../public/images/blog.jpg";
import hostname from "@/constants/hostname.mjs";

const loginPage = async({searchParams}) => {
    const redirectTo = (await searchParams)?.redirectTo || "/";
    return <LoginForm redirectTo={redirectTo}/>
};

export default loginPage;


export async function generateMetadata() {
    const host = await hostname();
    const loginCoverUrl = `${host}${loginCover.src}`;
  
    const metadata = {
      title: `Login - ${websiteName}`,
      description: "Login to access your account.",
      keywords: ["login"],
      url: `${host}/login`,
      canonical: `${host}/login`,
      openGraph: {
        title: `Login - ${websiteName}`,
        description: "Login to access your account.",
        url: `${host}/login`,
        images: [
          {
            url: loginCoverUrl,
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
        title: `Login - ${websiteName}`,
        description: "Login to access your account.",
        images: [loginCoverUrl],
      },
    };
    return metadata;
  }