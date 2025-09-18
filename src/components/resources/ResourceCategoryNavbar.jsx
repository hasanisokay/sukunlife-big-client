"use client";

import { useEffect, useRef, useState } from "react";
const ResourceCategoryNavbar = ({heading, categories}) => {
  const [active, setActive] = useState(categories[0].id);
  const barRef = useRef(null);
  const listRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const topOffset = barRef.current?.offsetHeight ?? 0;
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);

    const ratios = new Map();

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        ratios.set(entry.target.id, entry.intersectionRatio);
      });

      let bestId = active;
      let bestRatio = -1;
      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestId && bestId !== active) setActive(bestId);
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: `-${topOffset + 8}px 0px -40% 0px`,
      threshold: thresholds,
    });
    observerRef.current = observer;

    const observeAll = () => {
      categories.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    };
    observeAll();

    // force first category at top
    const handleScroll = () => {
      if (window.scrollY < 20) {
        setActive(categories[0].id);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const btn = listRef.current?.querySelector(`[data-id="${active}"]`);
    if (btn) {
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [active]);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={barRef} className="sticky top-0 bg-white dark:bg-[#1f2937] z-20 pb-1 shadow-sm">
      <h2 className="text-center text-[24px] md:text-[28px] lg:text-[36px] font-bold charisSIL-font py-4">
      {heading}
      </h2>

      <div className="overflow-x-auto">
        <div
          ref={listRef}
          className="flex gap-6 md:gap-8 border-b-2 border-[#63953a] pb-2 px-4 whitespace-nowrap w-max mx-auto"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`text-sm md:text-base font-medium transition-colors ${
                active === cat.id
                  ? "text-green"
                  : "dark:text-white text-black hover:text-green"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceCategoryNavbar;
