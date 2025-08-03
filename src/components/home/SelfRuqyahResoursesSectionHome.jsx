import Link from "next/link";

const SelfRuqyahResoursesSectionHome = () => {
    return (
        <div className="montserrat-font pt-[100px] px-4 ">
            <div className=" explore-self-ruqyah-now-wrapper ">
                <div className="md:w-[482px] flex flex-col items-start justify-start">
                    <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight md:text-start text-center md:mx-0 mx-auto"><span className="text-green">Self-Ruqyah</span> <span>Resources</span></h2>
                    <p className="mt-[28px] md:mx-0 mx-auto">Empower yourself with authentic self-Ruqyah guides, duas, and methods to maintain your spiritual and emotional balance. Our resources include</p>
                    <Link className="btn-explore-self-ruqyah-now" href={'/resources'}>   <button className="w-[281px] h-[82px] btn-green bg-green text-white rounded-full">Explore self-healing now!</button></Link>
                </div>
                <div className="md:w-[482px] self-ruqyah-resources-right-side-div">
                    <div className="flex items-center gap-[28px] mb-[28px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="59"
                            height="59"
                            fill="none"
                            viewBox="0 0 59 59"
                        >
                            <path
                                fill="#63953A"
                                d="M55.313 12.906v29.5a3.69 3.69 0 0 1-3.688 3.688H16.594V35.03H29.5V23.97h12.906V12.906z"
                                opacity="0.2"
                            ></path>
                            <path
                                fill="#63953A"
                                d="M57.156 12.906a1.844 1.844 0 0 1-1.843 1.844H44.25v9.219a1.844 1.844 0 0 1-1.844 1.843H31.344v9.22a1.844 1.844 0 0 1-1.844 1.843H18.438v9.219a1.844 1.844 0 0 1-1.844 1.843H3.687a1.844 1.844 0 0 1 0-3.687H14.75v-9.219a1.844 1.844 0 0 1 1.844-1.843h11.062v-9.22a1.844 1.844 0 0 1 1.844-1.843h11.063v-9.219a1.844 1.844 0 0 1 1.843-1.844h12.907a1.844 1.844 0 0 1 1.843 1.844"
                            ></path>
                        </svg>
                        <p>Step-by-step self-Ruqyah instructions</p>
                    </div>
                    <div className="flex items-center gap-[28px] mb-[28px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="59"
                            height="59"
                            fill="none"
                            viewBox="0 0 51 51"
                        >
                            <path
                                fill="#63953A"
                                d="M25.5 49.513 18.381 42.5H8.5v-9.881L1.487 25.5 8.5 18.381v-9.88h9.881L25.5 1.487 32.619 8.5H42.5v9.881l7.013 7.119-7.013 7.119V42.5h-9.881zm2.178-25.075 3.134-2.285 3.082 2.285-1.222-3.613 3.134-2.284h-3.825l-1.169-3.666-1.168 3.666h-3.878l3.134 2.284zM25.5 36.125q4.41 0 7.518-3.081 3.109-3.081 3.107-7.544 0-.425-.026-.85a4.5 4.5 0 0 0-.133-.85q-.585 2.497-2.604 4.118-2.017 1.621-4.728 1.62-3.187 0-5.365-2.179t-2.178-5.365q0-2.444 1.38-4.382a7.4 7.4 0 0 1 3.613-2.737H25.5q-4.463 0-7.544 3.109T14.875 25.5q0 4.463 3.081 7.544t7.544 3.081"
                            ></path>
                        </svg>
                        <p>Recommended Surahs & Duas for protection</p>
                    </div>
                    <div className="flex items-center gap-[28px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="59"
                            height="59"
                            fill="none"
                            viewBox="0 0 54 54"
                        >
                            <path
                                fill="#63953A"
                                d="M38.25 36h-4.5v13.5H27V38.25h-9V49.5h-6.75V36h-4.5L22.5 22.5zM13.5 4.5l9 9h-2.25v6.75h-4.5V13.5h-4.5v6.75h-4.5V13.5H4.5zm27 2.25L51.75 18H49.5v9h-6.75v-6.75h-4.5V27h-3.735L31.5 24.457V18h-2.25z"
                            ></path>
                        </svg>
                        <p>Recommended Surahs & Duas for protection</p>
                    </div>
                </div>
            </div>
            <div className="btn-explore-self-ruqyah-now2-wrapper">
                <Link className="btn-explore-self-ruqyah-now2" href={'/resources'}>   <button className="md:w-[350px] w-[320px] h-[60px] md:h-[82px] btn-green bg-green text-white rounded-full">Explore self-healing now!</button></Link>
            </div>

        </div>
    );
};

export default SelfRuqyahResoursesSectionHome;