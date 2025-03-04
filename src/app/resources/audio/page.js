import AudioPage from "@/components/resources/AudioPage";
import hostname from "@/constants/hostname.mjs";
import audioCover from "@/../public/images/audio.jpg";
import { websiteName } from "@/constants/names.mjs";
const page = async() => {
    return <AudioPage />
};

export default page;


export async function generateMetadata() {
  try {
    const host = await hostname();
    const audioCoverUrl = `${host}${audioCover.src}`;

    const metadata = {
      title: `Audio Resources`,
      description:
        "Listen to Sukunlife's curated audio resources, including podcasts and guides for personal growth.",
      keywords: [
        "Sukunlife audio",
        "podcasts",
        "audio resources",
        "self-improvement audio",
        "learning audio",
        "motivational audio",
        "digital audio",
        "audio guides",
        "sound content",
        "multimedia",
      ],
      alternates: {
        canonical: `${host}/resources/audio`,
      },
      openGraph: {
        title: `Audio Resources - ${websiteName}`,
        description:
          "Explore Sukunlife's collection of audio content, from podcasts to insightful audio guides.",
        url: `${host}/resources/audio`,
        siteName: websiteName,
        images: [
          {
            url: audioCoverUrl,
            width: 1200,
            height: 630,
            alt: `${websiteName} Audio Resources`,
          },
        ],
        locale: "bn_BD",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Audio Resources - ${websiteName}`,
        description:
          "Discover Sukunlife's audio resources for learning and inspiration!",
        images: [audioCoverUrl],
      },
    };

    // Remove duplicates and limit keywords
    metadata.keywords = [...new Set(metadata.keywords)]
      .filter(kw => kw && kw.length > 2)
      .slice(0, 10);

    return metadata;
  } catch (error) {
    console.error("Audio metadata generation failed:", error);
    const host = await hostname();
    return {
      title: `Audio Resources - ${websiteName}`,
      description: "Listen to Sukunlife's audio resources.",
      alternates: {
        canonical: `${host}/resources/audio`,
      },
    };
  }
}