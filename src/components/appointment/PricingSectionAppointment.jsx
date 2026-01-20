import React from 'react';

const PricingSectionAppointment = () => {
    return (
                  <section className="pricing-section-appointment">
                <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">Our <span className="text-green">Pricing</span></h2>
                <p className="max-w-[880px] mx-auto text-center px-2">
                    Our services are offered with care, sincerity, and transparency.
                    Below you’ll find clear pricing for our Ruqyah and healing sessions,
                    allowing you to choose what feels right for your situation.
                </p>
                <h3 className=" charisSIL-font md:text-[32px] text-[24px] font-bold leading-tight text-center ">Ruqyah Services</h3>
                <div className="ruqyah-session-card">
                    <p className="text-green charisSIL-font md:text-[24px] text-[20px]">3,800 BDT</p>
                    <h4 className="italic font-bold text-[20px]">Ruqyah Session</h4>
                    <p className="text-[#878484]">A full personalized Ruqyah session for spiritual healing and protection.</p>
                </div>
                <div className="ruqyah-session-card">
                    <p className="text-green charisSIL-font md:text-[24px] text-[20px]">From 9,000 BDT (based on location & duration)</p>
                    <h4 className="italic font-bold text-[20px]">Ruqyah Home Service</h4>
                    <p className="text-[#878484]">Personalized Ruqyah conducted at your home, ensuring comfort and privacy.</p>
                </div>
                <div className="ruqyah-session-card">
                    <p className="text-green charisSIL-font md:text-[24px] text-[20px]">From 1,000 BDT (depending on requirements)</p>
                    <h4 className="italic font-bold text-[20px]">Ruqyah Consultancy</h4>
                    <p className="text-[#878484]">One-to-one spiritual consultation and guidance based on your situation.</p>
                </div>
                <div className="flex gap-[30px] flex-col mt-[21px]">
                    <h3 className=" charisSIL-font md:text-[32px] text-[24px] font-bold leading-tight text-center ">Hijama (Cupping Therapy)</h3>
                    <div className="ruqyah-session-card">
                        <p className="text-green charisSIL-font md:text-[24px] text-[20px]">3,500 BDT</p>
                        <h4 className="italic font-bold text-[20px]">Hijama Detox Package</h4>
                        <p className="text-[#878484]">A comprehensive Hijama package designed for detoxification and wellness.</p>
                    </div>
                    <div className="ruqyah-session-card">
                        <p className="text-green charisSIL-font md:text-[24px] text-[20px]">2,500 BDT</p>
                        <h4 className="italic font-bold text-[20px]">Standard Hijama</h4>
                        <p className="text-[#878484]">A standard Hijama session performed with care and hygienic practice.</p>
                    </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-8 px-2">
                    If you are unsure which service is suitable for you,
                    our team is happy to guide you before booking.
                </p>
            </section>
    );
};

export default PricingSectionAppointment;