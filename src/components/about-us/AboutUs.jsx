import Image from "next/image";
import aboutUsBanner from "@/../public/bgImages/about-us.jpg";
import FeaturesSection from "./FeaturesSection";
import ServicesSection from "./ServicesSection";
import TestimonialSectionInAboutUs from "./TestimonialSectionInAboutUs";

const AboutUs = () => {
    return (
        <div className="montserrat-font ">
            {/* <section className=" w-full h-[665px] flex items-center justify-center text-center text-white "> */}
            <section className="text-white h-[665px] flex flex-col items-center justify-center  text-center ">
                <div className="absolute top-0 bottom-0 right-0 left-0 h-[665px]">
                    <Image className="w-full h-[665px]  object-cover pointer-events-none select-none" src={aboutUsBanner} width={1000} height={1000} alt="About Us Banner" />
                </div>
                <div className="bg-black bg-opacity-[41%] w-full h-[665px] absolute top-0 bottom-0 right-0 left-0">
                </div>
                <div className="relative z-10 max-w-4xl md:px-6 px-4 md:-mt-0 -mt-[100px]">
                    <div className="flex flex-col gap-[19px]">
                        <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">About Us</h2>
                        <p className="text-sm md:text-base">
                            Sukun is an Arabic word that means tranquility, calmness, and peace.
                            Allah says in the Qur’an
                        </p>
                        <p className="italic charisSIL-font font-semibold text-lg md:text-xl leading-relaxed">
                            “It is He who sent down tranquility (Sakinah) into the hearts of the
                            believers so that they would grow more in faith.”
                            <br />
                            <span className="block mt-2">(Surah Al-Fath, 4)</span>
                        </p>
                        <p className="text-sm md:text-base mt-6">
                            The journey of Sukun Life began with a clear purpose: to help people
                            find peace through faith—relief from physical, mental, and spiritual
                            afflictions—through the guidance of the Qur’an and Sunnah.
                        </p>
                    </div>
                </div>
            </section>
            {/* </section> */}
            {/* our purpose */}

            <section className="relative max-w-4xl mx-auto text-black flex flex-col items-start justify-center gap-[33px] px-4">
                <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight md:text-start text-center md:mx-0 mx-auto">
                    Our <span className="text-green">Purpose</span>
                </h2>
                <p>In a world full of stress, restlessness, and unseen challenges, Sukun Life stands as a center of hope and healing. By Allah&rsquo;s will, we aim to guide individuals toward a peaceful life, both physically and spiritually.
                    Our services began with a dedicated Ruqaya Center and are gradually expanding to include Islamic psychology and mental health support.</p>
            </section>

            <FeaturesSection />
            <ServicesSection />
            <TestimonialSectionInAboutUs />
        </div>
    );
};

export default AboutUs;
