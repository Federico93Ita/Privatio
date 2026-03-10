"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// pathname is used for active nav state
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/cerca", label: "Cerca Casa" },
  { href: "/come-funziona", label: "Come Funziona" },
  { href: "/agenzie", label: "Per le Agenzie" },
];

/** Returns the dashboard path based on the user's role */
function getDashboardPath(role?: string): string {
  if (role === "AGENCY_ADMIN" || role === "AGENCY_AGENT") {
    return "/dashboard/agenzia";
  }
  return "/dashboard/venditore";
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isLoggedIn = status === "authenticated";
  const dashboardPath = getDashboardPath(session?.user?.role);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-sm"
            : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="0"
                    y1="0"
                    x2="36"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#0e8ff1" />
                    <stop offset="1" stopColor="#0a1f44" />
                  </linearGradient>
                </defs>
                <rect rx="8" width="36" height="36" fill="url(#logo-gradient)" />
                <text
                  x="50%"
                  y="53%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="white"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="700"
                  fontSize="22"
                >
                  P
                </text>
              </svg>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "Poppins, sans-serif", color: "#0a1f44" }}
              >
                Privatio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-4 md:flex">
              {isLoggedIn ? (
                <Link
                  href={dashboardPath}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/accedi"
                    className="text-sm font-medium text-text-muted transition-colors hover:text-primary"
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/vendi"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
                  >
                    Vendi Casa
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={mobileOpen}
            >
              <div className="flex w-5 flex-col items-center gap-[5px]">
                <motion.span
                  className="block h-[2px] w-5 rounded-full bg-primary-dark"
                  animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="block h-[2px] w-5 rounded-full bg-primary-dark"
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-[2px] w-5 rounded-full bg-primary-dark"
                  animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-40 flex w-72 flex-col bg-white px-6 pt-24 shadow-xl md:hidden"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-bg-soft hover:text-primary ${
                        isActive
                          ? "bg-primary/5 text-primary"
                          : "text-text"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <hr className="my-4 border-border" />

              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                  <Link
                    href={dashboardPath}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/accedi"
                      className="rounded-lg px-4 py-3 text-base font-medium text-text-muted transition-colors hover:bg-bg-soft hover:text-primary"
                    >
                      Accedi
                    </Link>
                    <Link
                      href="/vendi"
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
                    >
                      Vendi Casa
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
