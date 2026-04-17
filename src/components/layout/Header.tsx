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
  { href: "/faq", label: "FAQ" },
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
            ? "bg-[#0B1D3A]/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-semibold tracking-[-0.03em] text-white">
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
                    className={`text-sm transition-colors duration-200 hover:text-white ${
                      isActive ? "text-[#C9A84C] font-medium" : "text-white/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-4 md:flex">
              {isLoggedIn ? (
                <Link
                  href={dashboardPath}
                  className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-medium text-[#0B1D3A] shadow-sm transition-all duration-300 hover:bg-[#D4B65E]"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/accedi"
                    className="text-sm text-white/80 transition-colors duration-200 hover:text-white"
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/vendi"
                    className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-medium text-[#0B1D3A] shadow-sm transition-all duration-300 hover:bg-[#D4B65E]"
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
                  className="block h-[2px] w-5 rounded-full bg-white"
                  animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="block h-[2px] w-5 rounded-full bg-white"
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-[2px] w-5 rounded-full bg-white"
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
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-medium text-white shadow-sm shadow-primary/10 transition-all duration-300 hover:bg-primary/85"
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
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-medium text-white shadow-sm shadow-primary/10 transition-all duration-300 hover:bg-primary/85"
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
