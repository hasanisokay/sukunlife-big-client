import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import aboutUsCover from "@/../public/images/sukunlife.jpg";
import AboutUs from "@/components/about-us/AboutUs";

const page = async () => {
  return (
    <>
      <AboutUs />
    </>
  );
};

export default page;

export async function generateMetadata() {
  try {
    const host = await hostname();
    const aboutUsCoverUrl = `${host}${aboutUsCover.src}`;

    const metadata = {
      title: `About Us`,
      description:
        "Learn more about Sukun Life — our vision, values, and the passionate team working to empower lifelong learners with meaningful insights and educational content.",
      keywords: [
        "sukunlife",
        "about sukunlife",
        "our story",
        "sukunlife team",
        "education platform",
        "learning community",
        "about us",
        "who we are",
        "learning insights",
        "educational mission",
      ],
      alternates: {
        canonical: `${host}/about-us`,
      },
      openGraph: {
        title: `About Us - ${websiteName}`,
        description:
          "Discover the people, purpose, and philosophy behind Sukun Life. We're on a mission to make quality learning accessible, inspiring, and human-centered.",
        url: `${host}/about-us`,
        siteName: websiteName,
        images: [
          {
            url: aboutUsCoverUrl,
            width: 1200, // Increased for better quality
            height: 630, // Optimized for social sharing
            alt: `${websiteName} About Us Featured Image`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `About Us - ${websiteName}`,
        description:
          "Behind every lesson is a story. Get to know Sukun Life — where learning meets purpose.",
        images: [aboutUsCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter((kw) => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("About us metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `About Us - ${websiteName}`,
      description: "Learn more about the vision and team behind Sukun Life.",
      alternates: {
        canonical: `${host}/blog`,
      },
    };
  }
}
