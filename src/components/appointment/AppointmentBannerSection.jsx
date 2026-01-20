import Image from "next/image";
import bookAppointment from "@/../public/bgImages/about-us.jpg";

const AppointmentBannerSection = ({handleCardSelect}) => {
    return (
             <section className="text-white banner-container-appointment flex flex-col items-center justify-center  text-center ">
                <div className="absolute top-0 bottom-0 right-0 left-0 ">
                    <Image className="w-full  bg-image-banner  object-cover pointer-events-none select-none" src={bookAppointment} width={1000} height={1000} alt="Book an appointment banner" />
                </div>
                <div className="bg-black bg-opacity-[41%] w-full bg-image-banner absolute top-0 bottom-0 right-0 left-0">
                </div>
                <div className="relative z-10 md:px-6 px-4 md:-mt-0 -mt-[10px]">
                    <div className="flex flex-col gap-[19px]">
                        <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">Book an Appointment</h2>
                        <p className="text-sm md:text-base max-w-4xl text-center mx-auto">
                            We offer a range of specialized spiritual and holistic services designed to restore your physical, emotional, and spiritual well-being. Book your session with ease and begin your journey towards healing today.
                        </p>
                    </div>
                    <div className="min-h-[294px] mt-[75px]">
                        <div className="session-cards-container ">
                            <div className="w-[255px] group  bg-white text-black rounded-[27px] ">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[249px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 106 106"
                                    >
                                        <path
                                            fill="#63953A"
                                            d="m53 68.81 45.425-18.762c.051-.021.106-.029.155-.047v-.246a2.12 2.12 0 0 0-2.9-1.971l-1.34.53V38.35a2.12 2.12 0 0 0-3.01-1.924c-4.16 1.946-11.65 5.237-16.07 5.974C68.9 43.46 57.24 45.58 53 56.18c-4.24-10.6-15.9-12.72-22.26-13.78-4.42-.742-11.91-4.028-16.07-5.975a2.12 2.12 0 0 0-3.01 1.924v9.964l-1.341-.53a2.12 2.12 0 0 0-2.9 1.974v.246c.052.018.107.026.156.047z"
                                        ></path>
                                        <path
                                            fill="#63953A"
                                            d="M98.831 52.1 53 71.027 7.169 52.1a2.12 2.12 0 0 0-2.929 1.96v.702a2.12 2.12 0 0 0 1.31 1.96l37.6 15.53-26.826 14.8a1.06 1.06 0 0 0 .512 1.988H27.58c.684 0 1.357-.165 1.962-.481L53 76.32l23.458 12.239a4.24 4.24 0 0 0 1.962.481h10.744a1.06 1.06 0 0 0 .513-1.989l-26.826-14.8 37.599-15.53a2.12 2.12 0 0 0 1.31-1.96v-.701a2.12 2.12 0 0 0-2.929-1.96"
                                        ></path>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Ruqyah Session
                                    </p>
                                    <button onClick={() => handleCardSelect('ruqyah')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-[255px] group  bg-white text-black rounded-[27px]">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[249px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 88 88"
                                    >
                                        <path
                                            fill="#63953A"
                                            d="M69.95 71.03V47.743c-.273-17.923-16.757-27.345-33.019-23.701a24.34 24.34 0 0 0-18.902 23.7V71.03c1.343-.01 50.559-.007 51.921 0M46.998 30.672a1.34 1.34 0 0 1 1.617-.99A20.16 20.16 0 0 1 63.039 42.57a1.334 1.334 0 0 1-2.513.896A17.73 17.73 0 0 0 48 32.289a1.357 1.357 0 0 1-1.002-1.617M72.624 74.158a5.14 5.14 0 0 0-2.674-.454H18.03c-6.022-.752-6.916 8.537-.789 8.796H70.74c4.508.045 5.782-6.432 1.885-8.342M42.345 20.753a38 38 0 0 1 9.117.641 7.69 7.69 0 0 0-6.136-8.448V8.174h1.315a1.337 1.337 0 0 0 0-2.674h-5.303a1.337 1.337 0 0 0 0 2.674h1.315v4.759a7.673 7.673 0 0 0-6.136 8.462 26.7 26.7 0 0 1 5.828-.642"
                                        ></path>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Hijama
                                    </p>
                                    <button onClick={() => handleCardSelect('hijama')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-[255px] group  bg-white text-black rounded-[27px]">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[249px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 80 80"
                                    >
                                        <g clipPath="url(#clip0_155_2370)">
                                            <path
                                                fill="#63953A"
                                                fillRule="evenodd"
                                                d="M42.205.136C52.151 1.354 59.227 10.404 58.01 20.35S47.74 37.372 37.795 36.154a18.06 18.06 0 0 1-8.25-3.178l-5.543 2.443a.79.79 0 0 1-.887-.159.79.79 0 0 1-.186-.88l2.301-5.698a18.08 18.08 0 0 1-3.239-12.742C23.21 5.994 32.26-1.082 42.205.136m-2.224 16.396a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226m-7.82 0a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226m15.679 0a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226M18.145 61.855c9.425 0 17.171 7.185 18.06 16.377.046.469-.094.89-.411 1.24a1.56 1.56 0 0 1-1.195.528H1.691c-.472 0-.878-.18-1.195-.529a1.56 1.56 0 0 1-.411-1.24c.889-9.19 8.635-16.376 18.06-16.376m0-19.961a9.174 9.174 0 1 1 0 18.348 9.174 9.174 0 0 1 0-18.348m43.71 19.96c9.424 0 17.171 7.186 18.06 16.378.045.469-.095.89-.411 1.24-.318.349-.723.528-1.195.528H45.4c-.471 0-.877-.18-1.194-.529a1.56 1.56 0 0 1-.412-1.24c.89-9.19 8.636-16.376 18.06-16.376m0-19.96a9.174 9.174 0 1 1 0 18.348 9.174 9.174 0 0 1 0-18.348"
                                                clipRule="evenodd"
                                            ></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_155_2370">
                                                <path fill="#fff" d="M0 0h80v80H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Counseling
                                    </p>
                                    <button onClick={() => handleCardSelect('counseling')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-[255px] group  bg-white text-black rounded-[27px]">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[290px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 79 79"
                                    >
                                        <g fill="red" clipPath="url(#clip0_155_2372)">
                                            <path d="M61.78 66.923H17.216c-5.678.002-10.281 4.605-10.283 10.283h65.13c0-5.68-4.603-10.283-10.283-10.283M39.5 18.933c-12 0-20.567 8.569-20.567 21.155v23.251h41.134V40.088c0-12.586-8.562-21.155-20.567-21.155M53.218 44.72c-.989 0-1.791-.803-1.791-1.792 0-6.43-3.158-12.33-7.347-13.724a1.793 1.793 0 1 1 1.132-3.405c5.677 1.894 9.798 9.098 9.798 17.129 0 .989-.802 1.792-1.791 1.792M12.075 41.292H1.792a1.793 1.793 0 0 1 0-3.584h10.283a1.793 1.793 0 0 1 0 3.584M18.788 21.456c-.475 0-.932-.188-1.267-.525l-6.856-6.858A1.792 1.792 0 0 1 13.2 11.54l6.856 6.858a1.793 1.793 0 0 1-1.267 3.059M39.5 13.867c-.99 0-1.792-.803-1.792-1.792V1.792a1.793 1.793 0 0 1 3.584 0v10.283c0 .99-.803 1.792-1.792 1.792M60.6 21.067a1.792 1.792 0 0 1-1.268-3.059l6.856-6.855a1.792 1.792 0 1 1 2.535 2.534l-6.857 6.855a1.79 1.79 0 0 1-1.267.525M77.208 41.292H66.925a1.793 1.793 0 0 1 0-3.584h10.283a1.793 1.793 0 0 1 0 3.584"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_155_2372">
                                                <path fill="#fff" d="M0 0h79v79H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Emergency Ruqyah Session
                                    </p>
                                    <button onClick={() => handleCardSelect('emergency-ruqyah')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
    );
};

export default AppointmentBannerSection;