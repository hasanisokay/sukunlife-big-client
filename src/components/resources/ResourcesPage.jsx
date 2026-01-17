"use client";

import Image from "next/image";
import Link from "next/link";
import resourceBanner from "@/../public/images/resources_header_banner.jpeg";
import { AudioIcon, LiteratureIcon, QuranIcon, VideoIcon, VideoSVG } from "../svg/SvgCollection";

const resourceCategories = [
  {
    id: "audio",
    title: "Audio Ruqyah",
    description:
      "Listen to authentic Ruqyah recitations to support spiritual healing and protection.",
    href: "/resources/audio",
    icon: <AudioIcon />,
  },
  {
    id: "quran",
    title: "Quranic Healing Verses",
    description:
      "Carefully selected Quranic ayat with guidance for reflection, reading, and listening.",
    href: "/resources/quran",
    icon: <QuranIcon />,
  },
  {
    id: "video",
    title: "Educational Videos",
    description:
      "Watch trusted scholars explain Ruqyah, spiritual wellness, and Islamic healing.",
    href: "/resources/video",
    icon: <VideoIcon />,
  },
  {
    id: "literature",
    title: "Literature & Guides",
    description:
      "Download and read structured guides, articles, and learning material.",
    href: "/resources/literature",
    icon: <LiteratureIcon />,
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Banner */}
      <div className="relative h-[420px]">
        <Image
          src={resourceBanner}
          alt="Resources Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white text-[28px] md:text-[40px] font-bold mb-4">
            Explore Our Spiritual Resources
          </h1>
          <p className="text-white max-w-[720px] text-base md:text-lg">
            Choose the type of resource you are looking for and continue your
            journey with authentic, Quran- and Sunnah-based guidance.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-[1200px] mx-auto py-20 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {resourceCategories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-[40px]">{item.icon}</div>
                <div>
                  <h3 className="text-[22px] font-semibold mb-2 group-hover:text-green transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center font-semibold text-green">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Guidance text */}
        <p className="text-center text-gray-500 mt-16 max-w-[720px] mx-auto">
          All resources are curated to help you perform Ruqyah with confidence,
          clarity, and sincerity — at your own pace.
        </p>
      </div>
    </div>
  );
}
