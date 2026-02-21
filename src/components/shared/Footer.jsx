'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const [isCoursePage, setIsCoursePage] = useState(false)
  const [isDashboardPage, setIsDashboardPage] = useState(false)
  const currentPath = usePathname();
  useEffect(() => {
    if (currentPath.startsWith("/courses/")) {
      const segments = currentPath.split("/").filter(Boolean);
      // ["courses", ":courseId", ":moduleId", ":itemId"]
      if (segments?.length > 2) {
        setIsCoursePage(true)
      } else setIsCoursePage(false)
    }
    if (currentPath.startsWith("/dashboard")) {
      setIsDashboardPage(true)
    }
  }, [currentPath])
  if (isCoursePage || isDashboardPage) return null;
  return (
    <footer className="bg-[#2B2B2B] text-white px-6 md:px-16 py-10 text-sm">
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-gray-300 list-disc list-inside">
            <li>
              <a href="https://test.sukunlife.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Ruqyah Diagnosis</a>
            </li>
            <li>
              <Link href="/about-us" className="hover:underline">About Us</Link>
            </li>
            <li>
              <Link href="/book-appointment" className="hover:underline">Appointment</Link>
            </li>
            <li>
              <Link href="/shop" className="hover:underline">Supplements</Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-2">Resources</h3>
          <ul className="space-y-1 text-gray-300 list-disc list-inside">
            <li>
              <Link href="/blog/tags/self-ruqyah-guide" className="hover:underline">Self-Ruqyah Guide</Link>
            </li>
            <li>
              <Link href="/resources#audio" className="hover:underline">Audio Downloads</Link>
            </li>
            <li>
              <Link href="/resources#pdf" className="hover:underline">PDF Downloads</Link>
            </li>
          </ul>
        </div>

        {/* Learn More */}
        <div>
          <h3 className="font-semibold mb-2">Learn More</h3>
          <ul className="space-y-1 text-gray-300 list-disc list-inside">
            <li>
              <Link href="/blog/tags/ruqyah" className="hover:underline">Ruqyah</Link>
            </li>
            <li>
              <Link href="/blog/tags/evil-eye" className="hover:underline">Evil Eye</Link>
            </li>
            <li>
              <Link href="/blog/tags/jinn" className="hover:underline">Jinn</Link>
            </li>
            <li>
              <Link href="/blog/tags/black-magic" className="hover:underline">Magic or Black Magic</Link>
            </li>
            <li>
              <Link href="/blog/tags/waswasa" className="hover:underline">Whispers (Waswasa)</Link>
            </li>
          </ul>
        </div>

        {/* About Sukun Life */}
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-2">About Sukun Life</h3>
          <p className="text-gray-300 mb-4">
            Sukun Life is committed to providing spiritual healing, guidance, and natural remedies rooted in Qur’an and Sunnah. We aim to bring peace and balance to every life we touch.
          </p>
          <div className="space-y-1">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href="mailto:info@sukunlife.org" className="text-gray-300 hover:underline">
                info@sukunlife.org
              </a>
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{' '}
              <a href="tel:01915109430" className="text-gray-300 hover:underline">
                01915109430
              </a>
            </p>
          </div>
        </div>

      </div>

      <div className="text-gray-400 mt-10 text-xs text-left">
        © 2025 Sukun Life. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;