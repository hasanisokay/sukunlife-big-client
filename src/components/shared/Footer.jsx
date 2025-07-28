import React from 'react';

const Footer = () => {
    return (
       <footer className="bg-[#2B2B2B] text-white px-6 md:px-16 py-10 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-gray-300">
            <li>• Ruqyah Diagnosis</li>
            <li>• About Us</li>
            <li>• Appointment</li>
            <li>• Supplements</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-2">Resources</h3>
          <ul className="space-y-1 text-gray-300">
            <li>• Self-Ruqyah Guide</li>
            <li>• Audio Downloads</li>
            <li>• PDF Downloads</li>
          </ul>
        </div>

        {/* Learn More */}
        <div>
          <h3 className="font-semibold mb-2">Learn More</h3>
          <ul className="space-y-1 text-gray-300">
            <li>• Ruqyah</li>
            <li>• Evil Eye</li>
            <li>• Jinn</li>
            <li>• Magic or Black Magic</li>
            <li>• Whispers (Waswasa)</li>
          </ul>
        </div>

        {/* About Sukun Life */}
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-2">About Sukun Life</h3>
          <p className="text-gray-300 mb-4">
            Sukun Life is committed to providing spiritual healing, guidance, and natural remedies rooted in Qur’an and Sunnah. We aim to bring peace and balance to every life we touch.
          </p>
          <div>
            <p><span className="font-semibold">Email:</span> info@sukunlife.org</p>
            <p><span className="font-semibold">Phone:</span> +880 1234 567 890</p>
          </div>
        </div>
      </div>

      <div className=" text-gray-400 mt-10 text-xs text-left">
        © 2025 Sukun Life. All Rights Reserved.
      </div>
    </footer>
    );
};

export default Footer;