'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/slices/themeSlice";
import logOut from "@/utils/logOut.mjs";
import Image from "next/image";
import logo from "@/../public/images/logo.png";
import { setUserData } from "@/store/slices/authSlice";
// import logoDark from "@/../public/images/logo-dark.png";
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = usePathname()
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const user = useSelector(state => state.user.userData)
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setVisible(false);
      setMenuOpen(false)
    } else {
      setVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastScrollY]);

  const handleLogOut = () => {
    logOut();
    dispatch(setUserData(null));
    window.location.reload()
  }
  const getLinkClass = (p) => {
    let path = p;
    return path === currentPath
      ? "text-white bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
      : "dark:text-white text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium";
  };
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.mode)
  const themeSwitch = <button className="px-3 py-2 " onClick={() => dispatch(toggleTheme())}>
    {theme === "dark" ? <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        id="SVGRepo_iconCarrier"
        stroke="#ffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3.32 11.684a9 9 0 0 0 17.357 3.348A9 9 0 0 1 8.32 6.683c0-1.18.23-2.32.644-3.353a9 9 0 0 0-5.645 8.354"
      ></path>
    </svg> : <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <g id="SVGRepo_iconCarrier" fill="#000000">
        <path d="M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0"></path>
        <path
          fillRule="evenodd"
          d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75"
          clipRule="evenodd"
        ></path>
      </g>
    </svg>}
  </button>
  return (
    <div className="h-[64px]">
      <div className="dark:bg-[#0c0c0e]  sticky top-0 z-50 w-full bg-gray-700 supports-[backdrop-filter]:bg-background/60  shadow-lg">
        {/* <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8"> */}
        <nav className={`fixed top-0 left-0 w-full  mx-auto px-2 sm:px-6 lg:px-8 z-50 transition-transform
                bg-opacity-85 backdrop-blur-sm 
                duration-300 ${visible ? 'transform-none  border-border/40 dark:shadow-xl shadow-md' : '-translate-y-full'
          }`} aria-label="Global">
          <div className="relative flex items-center justify-between h-16">

            <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={menuOpen ? "true" : "false"}
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? <span className="text-red-500 block h-6 w-6">&#10006;</span> : <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>}
              </button>
            </div>
            <div className="md:hidden flex absolute inset-y-0 left-0  items-center">
              {themeSwitch}
            </div>
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold">
                  {theme === "light" ? <Image src={logo} width={140} height={100} alt="logo" className="" /> : <Image src={logo} width={140} height={100} alt="logo" className="brightness-0 invert" />}
                </Link>
                {user && <button onClick={handleLogOut}>Log Out</button>}
              </div>
              <div className="hidden sm:block sm:ml-6">
                {themeSwitch}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <nav
          className={`${menuOpen ? "translate-x-0 opacity-100" : "-translate-y-full opacity-0"} duration-500 transition-all absolute top-[64px] right-0 w-[200px] sm:hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300'} rounded-lg shadow-lg backdrop-blur-lg`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 ">
            <Link href="/" className={getLinkClass("/")}>হোম</Link>
            {user && <div className={`flex items-center justify-start ${currentPath.includes('/deposits')
              ? "text-white bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              : "dark:text-white text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"}
       flex gap-4 `}>
              <Link href="/deposits" className="">
                আমানত
              </Link>
              <Link href="/deposits/new">
                +
              </Link>
            </div>}
            {user && <div className={`flex items-center justify-start ${currentPath.includes('/members')
              ? "text-white bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              : "dark:text-white text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"}
       flex gap-4 `}>
              <Link href="/members" className="">
                সদস্য
              </Link>
              <Link href="/members/new">
                +
              </Link>
            </div>}
            {user && <div className={`flex items-center justify-start ${currentPath.includes('/projects')
              ? "text-white bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              : "dark:text-white text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"}
       flex gap-4 `}>
              <Link className="text-inherit" href="/projects">
                প্রোজেক্ট
              </Link>
              <Link className="text-inherit" href="/projects/new">
                +
              </Link>
            </div>}
            <div className={getLinkClass("/profile")}>
              {user && <Link href="/profile" >প্রোফাইল</Link>}
            </div>
            {user && <button className="dark:text-white text-black px-3 py-2 rounded-md text-sm font-medium" onClick={handleLogOut}>লগ আউট</button>}

          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
