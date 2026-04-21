'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CartSVG } from "../svg/SvgCollection";
import { setCartData } from "@/store/slices/cartSlice";
import Image from "next/image";
import logoSrc from "@/../public/logo-sukunlife-new.png"

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
  const [cartItems, setCartItems] = useState(cart?.length || 0)
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const [isCoursePage, setIsCoursePage] = useState(false)

  useEffect(() => {
    if (currentPath.startsWith("/courses/")) {
      const segments = currentPath.split("/").filter(Boolean);
      // ["courses", ":courseId", ":moduleId", ":itemId"]
      if (segments?.length > 2) {
        setIsCoursePage(true)
      } else setIsCoursePage(false)
    }
  }, [currentPath])

  useEffect(() => {
    setMenuOpen(false)
  }, [currentPath])

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
  }, [user]);


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




  const getLinkClass = (path) => {
    return path === currentPath
      ? "text-white bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
      : "relative  px-3 py-2 rounded-md text-sm font-medium group transition-colors";
  };
  if (isCoursePage) { return <></> }

  return (
    <div ref={navRef} className="md:h-[110px] h-[64px] montserrat-font ">
      <div className="dark:bg-[#0c0c0e] sticky top-0 z-50 w-full bg-gray-700 supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <nav
          className={`fixed  top-0 left-0 w-full mx-auto px-2 bg-gray-100 dark:bg-[#111827]  sm:px-6 lg:px-8 z-50 transition-transform duration-300  shadow-md border-b border-gray-500/20 ${visible ? "transform-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]" : "-translate-y-full shadow-none"
            }`}
          aria-label="Global"
        >
          <div className="flex nav-wrapper  items-center justify-between relative">
            <div className="absolute inset-y-0 right-0 flex items-center nav-theme-switch-lg">
              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={menuOpen ? "true" : "false"}
              >
                <span className="sr-only">Open main menu</span>
                <motion.div
                  animate={menuOpen ? "open" : "closed"}
                  variants={{
                    open: { rotate: 180, scale: 1.1 },
                    closed: { rotate: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.3 }}

                >
                  {menuOpen ? (
                    <span className="  text-red-500 text-2xl">✖</span>
                  ) : (
                    <motion.svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        initial={{ d: "M4 6h16M4 12h16M4 18h16" }} // Set default path
                        animate={menuOpen ? "open" : "closed"}
                        variants={{
                          closed: { d: "M4 6h16M4 12h16M4 18h16" },
                          open: { d: "M6 6L18 18M6 18L18 6" },
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.svg>
                  )}
                </motion.div>
              </button>
            </div>
            <Link href="/" className="">


              <Image src={logoSrc} alt="Logo" width={1000} height={1000} className="w-[100px] p-1 bg-transparent" />

            </Link>
            <div className="nav-items items-center justify-center ">
              <Link href="/about-us" className={getLinkClass("/about-us")}>
                About Us
              </Link>
              <Link href="/courses" className={getLinkClass("/courses")}>
                Courses
              </Link>
              <Link href="/shop" className={getLinkClass("/shop")}>
                Products
              </Link>
              <Link href="/blog" className={getLinkClass("/blog")}>
                Blog
              </Link>
              <Link href="/resources" className={getLinkClass("/resources")}>
                Resources
              </Link>
              {/* <Link href="/cart" className="relative">
                <motion.div
                  animate={cartItems > 0 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <CartSVG color={cartItems > 0 ? "#ef4444" : "currentColor"} />
                  <span
                    className={`absolute -top-3 right-0 text-xs ${cartItems > 0 ? "pop text-red-500" : ""
                      }`}
                  >
                    {cartItems < 100 ? cartItems : "99+"}
                  </span>
                </motion.div>
              </Link> */}
            </div>
            <div className="nav-items gap-[15px]">
              <button className="block w-[196px] h-[54px]">
                <Link
                  href="/book-appointment"
                  className="rounded-full btn-rounded-transparent block text-green  green-border"
                >
                  Book Appointment
                </Link>
              </button>
              {Object.entries(user ?? {}).length !== 0 ? (
                <button className="block w-[173px] h-[54px]">
                  <Link
                    href="/dashboard"
                    className="rounded-full btn-rounded-transparent block border-[#1f83b0] border"
                  >
                    Dashboard
                  </Link>
                </button>
              ) : (
                <>
                  <button className="block w-[173px] h-[54px]">
                    <Link
                      href="/signup"
                      className=" btn-rounded-green btn-rounded-transparent rounded-full block"
                    >
                      Sign Up
                    </Link>
                  </button>
                </>
              )}
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
                className="nav-theme-switch-lg"
                id="mobile-menu"
              >
                <div className="flex flex-col px-2 pt-2 pb-3 space-y-1">
                  <Link href="/about-us" className={getLinkClass("/about-us")}>
                    About Us
                  </Link>
                  <Link href="/courses" className={getLinkClass("/courses")}>
                    Courses
                  </Link>
                  <Link href="/shop" className={getLinkClass("/shop")}>
                    Products
                  </Link>
                  <Link href="/blog" className={getLinkClass("/blog")}>
                    Blog
                  </Link>
                  <Link href="/resources" className={getLinkClass("/resources")}>
                    Resources
                  </Link>
                  <button className="block w-[196px] h-[54px]">
                    <Link
                      href="/book-appointment"
                      className="rounded-full btn-rounded-transparent block text-green  green-border"
                    >
                      Book Appointment
                    </Link>
                  </button>
                  {Object.entries(user ?? {}).length !== 0 ? (
                    <button className="block w-[173px] h-[54px]">
                      <Link
                        href="/dashboard"
                        className="rounded-full btn-rounded-transparent block border-[#1f83b0] border"
                      >
                        Dashboard
                      </Link>
                    </button>
                  ) : (
                    <>
                      <button className="block w-[173px] h-[54px]">
                        <Link
                          href="/signup"
                          className=" btn-rounded-green btn-rounded-transparent rounded-full block"
                        >
                          Sign Up
                        </Link>
                      </button>
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