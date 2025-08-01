import Link from 'next/link';

const ServicesSection = () => {
    return (
        <section className='pt-[73px] pb-[43px]'>
            <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight  text-center md:mx-0 mx-auto">
                Our <span className="text-green">Services</span>
            </h2>
            <div className="px-4 pt-[50px] gap-[30px] flex flex-wrap items-start justify-center  our-services-wrapper">
                <div className='flex flex-col group justify-center items-center gap-[19px] session-card rounded-3xl w-[255px] min-h-[222px] max-h-[300px] py-[30px]'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="106"
                        height="106"
                        fill="none"
                        viewBox="0 0 106 106"
                    >
                        <path
                            fill="#63953A"
                            d="m53 68.81 45.425-18.762c.051-.021.106-.029.155-.047v-.246a2.12 2.12 0 0 0-2.9-1.971l-1.34.53V38.35a2.12 2.12 0 0 0-3.01-1.924c-4.16 1.946-11.65 5.237-16.07 5.974C68.9 43.46 57.24 45.58 53 56.18c-4.24-10.6-15.9-12.72-22.26-13.78-4.42-.742-11.91-4.028-16.07-5.975a2.12 2.12 0 0 0-3.01 1.924v9.964l-1.341-.53a2.12 2.12 0 0 0-2.9 1.974v.246c.052.018.107.026.156.047z"
                        ></path>
                        <path
                            fill="#63953A"
                            d="M98.831 52.1 53 71.028 7.169 52.1a2.12 2.12 0 0 0-2.929 1.96v.702a2.12 2.12 0 0 0 1.31 1.96l37.6 15.53-26.826 14.8a1.06 1.06 0 0 0 .512 1.988H27.58c.684 0 1.357-.165 1.962-.481L53 76.32 76.458 88.56a4.24 4.24 0 0 0 1.962.481h10.744a1.06 1.06 0 0 0 .513-1.989l-26.826-14.8 37.599-15.53a2.12 2.12 0 0 0 1.31-1.96v-.7a2.12 2.12 0 0 0-2.929-1.96"
                        ></path>
                    </svg>
                    <p className='font-semibold text-black'>Ruqyah Session</p>
                    <div className='block'>
                        <Link href={'/book-appointment#ruqyah-session'}>
                            <button className='hidden group-hover:block group-active:block btn-rounded-green rounded-full w-[172px] h-[54px]'>Book Now</button>
                        </Link>
                    </div>
                </div>
                <div className='flex flex-col group items-center gap-[19px] session-card rounded-3xl w-[255px] min-h-[222px] max-h-[300px] py-[30px]'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="106"
                        height="106"
                        fill="none"
                        viewBox="0 0 88 88"
                    >
                        <path
                            fill="#63953A"
                            d="M69.95 71.03V47.743c-.273-17.923-16.757-27.345-33.019-23.701a24.34 24.34 0 0 0-18.902 23.7V71.03c1.343-.01 50.559-.007 51.921 0M46.998 30.672a1.34 1.34 0 0 1 1.617-.99A20.16 20.16 0 0 1 63.039 42.57a1.334 1.334 0 0 1-2.513.896A17.73 17.73 0 0 0 48 32.289a1.357 1.357 0 0 1-1.002-1.617M72.624 74.158a5.14 5.14 0 0 0-2.673-.454H18.029c-6.021-.752-6.916 8.537-.788 8.796h53.498c4.508.045 5.782-6.432 1.885-8.342M42.345 20.753a38 38 0 0 1 9.117.641 7.69 7.69 0 0 0-6.136-8.448V8.174h1.315a1.337 1.337 0 0 0 0-2.674h-5.303a1.337 1.337 0 0 0 0 2.674h1.315v4.759a7.673 7.673 0 0 0-6.136 8.462 26.7 26.7 0 0 1 5.828-.642"
                        ></path>
                    </svg>
                    <p className='font-semibold text-black'>Hijama</p>
                    <div className='block'>
                        <Link href={'/book-appointment#hijama'}>
                            <button className='hidden group-hover:block group-active:block btn-rounded-green rounded-full w-[172px] h-[54px]'>Book Now</button>
                        </Link>
                    </div>
                </div>
                <div className='flex flex-col group items-center gap-[19px] session-card rounded-3xl w-[255px] min-h-[222px] max-h-[300px] py-[30px]'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                  width="106"
                        height="106"
                        fill="none"
                        viewBox="0 0 80 80"
                    >
                        <g clipPath="url(#clip0_150_386)">
                            <path
                                fill="#63953A"
                                fillRule="evenodd"
                                d="M42.205.136C52.151 1.354 59.227 10.404 58.01 20.35S47.74 37.372 37.795 36.154a18.06 18.06 0 0 1-8.25-3.178l-5.543 2.443a.79.79 0 0 1-.887-.159.79.79 0 0 1-.186-.881l2.301-5.697a18.08 18.08 0 0 1-3.239-12.742C23.21 5.994 32.26-1.082 42.205.136m-2.224 16.396a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226m-7.82 0a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226m15.679 0a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226M18.145 61.855c9.425 0 17.171 7.185 18.06 16.377.046.469-.094.89-.411 1.24a1.56 1.56 0 0 1-1.195.528H1.691c-.472 0-.878-.18-1.195-.529a1.56 1.56 0 0 1-.411-1.24c.889-9.19 8.635-16.376 18.06-16.376m0-19.961a9.174 9.174 0 1 1 0 18.348 9.174 9.174 0 0 1 0-18.348m43.71 19.96c9.424 0 17.171 7.186 18.06 16.378.045.469-.095.89-.411 1.24-.318.348-.723.528-1.195.528H45.4c-.471 0-.877-.18-1.194-.529a1.56 1.56 0 0 1-.412-1.24c.89-9.19 8.636-16.376 18.06-16.376m0-19.96a9.174 9.174 0 1 1 0 18.348 9.174 9.174 0 0 1 0-18.348"
                                clipRule="evenodd"
                            ></path>
                        </g>
                        <defs>
                            <clipPath id="clip0_150_386">
                                <path fill="#fff" d="M0 0h80v80H0z"></path>
                            </clipPath>
                        </defs>
                    </svg>
                    <p className='font-semibold text-black'>Counselling Session</p>
                    <div className='block'>
                        <Link href={'/book-appointment#counselling-session'}>
                            <button className='hidden group-hover:block group-active:block btn-rounded-green rounded-full w-[172px] h-[54px]'>Book Now</button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;