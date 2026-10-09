"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (windowHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
      }

      setIsVisible(totalScroll > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 end-6 z-40"
        >
          <div className="relative flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-11 h-11 transform -rotate-90 pointer-events-none absolute">
              <circle
                cx="22"
                cy="22"
                r="18"
                className="stroke-muted"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                className="stroke-primary transition-all duration-150"
                strokeWidth="2.5"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * scrollProgress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <Button
              size="icon"
              variant="secondary"
              onClick={scrollToTop}
              className="h-9 w-9 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all bg-card/90 backdrop-blur-sm border"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4 text-foreground" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
