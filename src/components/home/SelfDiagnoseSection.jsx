'use client';

import Image from "next/image";
import Link from "next/link";

import jinnImage from "@/../public/images/jinn-image.jpg";
import eyeImage from "@/../public/images/eye-image.jpg";
import weaknessImage from "@/../public/images/weakness-image.jpg";
import magicImage from "@/../public/images/magic-image.jpg";

const SelfDiagnosisSection = () => {
  const cards = [
    { title: 'Black Magic', img: magicImage, link: 'https://test.sukunlife.com/magic-test' },
    { title: 'Evil Eye (Ayn)', img: eyeImage, link: 'https://test.sukunlife.com/evil-eye-test' },
    { title: 'Jinn Disturbances', img: jinnImage, link: 'https://test.sukunlife.com/jinn-test' },
    { title: 'General Spiritual Weakness', img: weaknessImage, link: 'https://test.sukunlife.com/general-test' },
  ];

  return (
    <section className="px-6 py-16  flex flex-col lg:flex-row items-center justify-around gap-10 max-w-7xl mx-auto">
      {/* Left Content */}
      <div className="max-w-xl text-center lg:text-left">
        <h2 className="md:text-[60px] text-[30px] font-bold leading-tight">
          <span className="text-green">Self-Diagnose</span> <br />
          <span className="text-[#3E2E20] dark:text-white">Your Condition</span>
        </h2>
        <p className="mt-4 text-black dark:text-white text-sm sm:text-base">
          If you're experiencing unexplained health issues, mood swings, or distress, use our Self-Diagnosis Tool
          to identify possible spiritual concerns such as
        </p>
        <a href="https://test.sukunlife.com" target="_blank" rel="noopener noreferrer">
          <button className="mt-6 md:w-[350px] w-[320px] h-[60px] md:h-[82px] btn-rounded-green font-semibold rounded-full transition">
            Explore self-healing now!
          </button>
        </a>
      </div>

      {/* Right Content - Grid of Items */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-lg overflow-hidden shadow-md">
              {/* Image */}
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-[#63953A99] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Title - Moves to center on hover */}
              <div className="absolute bottom-2 left-2 right-2 text-white text-sm sm:text-base font-semibold transition-all duration-300 group-hover:bottom-1/2 group-hover:translate-y-1/2 text-center">
                {item.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SelfDiagnosisSection;
