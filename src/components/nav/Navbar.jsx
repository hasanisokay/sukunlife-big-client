'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/slices/themeSlice";
import logOut from "@/utils/logOut.mjs";
import Image from "next/image";
import logo from "@/../public/images/logo.png";
import { setUserData } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { CartSVG } from "../svg/SvgCollection";
import { setCartData } from "@/store/slices/cartSlice";
import userShortName from "./userShortName.mjs";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef();
  const currentPath = usePathname();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const user = useSelector((state) => state.user.userData);
  const cart = useSelector((state) => state.cart.cartData);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const [cartItems, setCartItems] = useState(cart?.length || 0)
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setVisible(false);
      setMenuOpen(false);
      setUserMenuOpen(false)
    } else {
      setVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    setCartItems(cart?.length || 0)
  }, [cart])

  useEffect(() => {
    try {
      const cartInStorage = localStorage.getItem('cart')
      let cartFromStorage;
      if (cartInStorage) {
        cartFromStorage = JSON.parse(cartInStorage) || [];
      } else {
        cartFromStorage = []
      }
      if (cart?.length < cartFromStorage?.length) {
        dispatch(setCartData(cartFromStorage));
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    } catch {
      localStorage.removeItem("cart");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (!menuOpen && !userMenuOpen) return;

    const handleClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setUserMenuOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClick);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [menuOpen, userMenuOpen]);


  const handleLogOut = () => {
    logOut();
    dispatch(setUserData(null));
    window.location.reload();
  };

  const getLinkClass = (path) => {
    return path === currentPath
      ? "text-white bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
      : "dark:text-white text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors";
  };

  const themeSwitch = (
    <button className="px-3 py-2" onClick={() => dispatch(toggleTheme())}>
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="#ffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3.32 11.684a9 9 0 0 0 17.357 3.348A9 9 0 0 1 8.32 6.683c0-1.18.23-2.32.644-3.353a9 9 0 0 0-5.645 8.354"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <g fill="#000000">
            <path d="M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0"></path>
            <path
              fillRule="evenodd"
              d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75"
              clipRule="evenodd"
            ></path>
          </g>
        </svg>
      )}
    </button>
  );

  return (
    <div ref={navRef} className="h-[64px]">
      <div className="dark:bg-[#0c0c0e] sticky top-0 z-50 w-full bg-gray-700 supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <nav
          className={`fixed top-0 left-0 w-full mx-auto px-2 sm:px-6 lg:px-8 z-50 transition-transform bg-opacity-85  backdrop-blur-3xl  duration-300 ${visible
            ? "transform-none border-border/40 dark:shadow-xl shadow-md"
            : "-translate-y-full"
            }`}
          aria-label="Global"
        >
          <div className="relative flex items-center justify-between h-16">
            <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={menuOpen ? "true" : "false"}
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? (
                  <span className="text-red-500 block h-6 w-6">&#10006;</span>
                ) : (
                  <svg
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
                  </svg>
                )}
              </button>
            </div>
            <div className="md:hidden flex absolute inset-y-0 left-0 items-center">
              {themeSwitch}
            </div>
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold">
                  {theme === "light" ? (
                    <Image src={logo} width={140} height={100} alt="logo" className="" />
                  ) : (
                    <Image src={logo} width={140} height={100} alt="logo" className="brightness-0 invert" />
                  )}
                </Link>
              </div>
              <div className="hidden sm:block sm:ml-6">
                {themeSwitch}
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <Link href="/shop" className={getLinkClass("/shop")}>
                Shop
              </Link>
              <Link href="/courses" className={getLinkClass("/courses")}>
                Courses
              </Link>
              <Link href="/book-appointment" className={getLinkClass("/book-appointment")}>
                Book Appointment
              </Link>
              <Link href="/blog" className={getLinkClass("/blog")}>
                Blog
              </Link>
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-sm font-medium  hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
                >
                  {user ? userShortName(user?.name) : "Login/Signup"}
                  <svg
                    className="ml-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1">
                        {user ? (
                          <>
                            <Link
                              href="/dashboard"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Dashboard
                            </Link>
                            <button
                              onClick={handleLogOut}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Log Out
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/login"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Login
                            </Link>
                            <Link
                              href="/signup"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Sign Up
                            </Link>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/cart" className="relative">
                <CartSVG color={cartItems > 0 && '#ef4444'} />
                <span className={`absolute -top-3 right-0 text-xs  ${cartItems > 0 ? 'pop text-red-500' : ''}`}
                >{cartItems < 100 ? cartItems : "99+"}</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="sm:hidden"
                id="mobile-menu"
              >
                <div className="flex flex-col px-2 pt-2 pb-3 space-y-1">
                  <Link href="/shop" className={getLinkClass("/shop")}>
                    Shop
                  </Link>
                  <Link href="/courses" className={getLinkClass("/courses")}>
                    Courses
                  </Link>
                  <Link href="/book-appointment" className={getLinkClass("/book-appointment")}>
                    Book Appointment
                  </Link>
                  <Link href="/blog" className={getLinkClass("/blog")}>
                    Blog
                  </Link>
                  {user ? (
                    <>
                      <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogOut}
                        className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium  hover:bg-gray-700 hover:text-white"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className={getLinkClass("/login")}>
                        Login
                      </Link>
                      <Link href="/signup" className={getLinkClass("/signup")}>
                        Sign Up
                      </Link>
                    </>
                  )}
                  <Link href="/cart" className={`flex ${getLinkClass("/cart")}`}>
                    <CartSVG color={cartItems > 0 && '#ef4444'} />
                    <span className={`text-xs  ${cartItems > 0 ? 'pop text-red-500' : ''}`}
                    >{cartItems < 100 ? cartItems : "99+"}</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;