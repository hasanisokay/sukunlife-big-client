'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Responsive Pagination component (Tailwind + morphic/neumorphic style)
 *
 * Props:
 *  - totalPages (number) - required
 *  - itemsPerPage (number) - optional (used for display)
 *  - totalItems (number) - optional (used for display)
 *  - initialPage (number) - optional - initial page if no `page` param in URL
 *  - onPageChange (page:number) => void - optional callback when page changes
 *  - siblingCount (number) - optional number of neighbors to show around current (default 1)
 *
 * Behavior:
 *  - Reads `page` from URL query param on mount (if present) and uses it as current page.
 *  - Updates URL param `?page=X` using router.replace (no history push).
 *  - Responsive: small screens show compact controls (Prev / Next / Page info).
 *  - Larger screens show full numeric buttons with ellipses when needed.
 *
 * Example usage:
 *  <Pagination totalPages={50} itemsPerPage={10} totalItems={500} onPageChange={(p)=>fetch(p)} />
 */

const RANGE_ELLIPSIS = '...';

function range(start, end) {
  const res = [];
  for (let i = start; i <= end; i++) res.push(i);
  return res;
}

const getPagination = (total, current, siblingCount = 1) => {
  // returns an array of page numbers and '...' markers
  // always show first and last
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, two ellipses spots
  if (total <= totalNumbers) {
    return range(1, total);
  }

  const left = Math.max(2, current - siblingCount);
  const right = Math.min(total - 1, current + siblingCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const pages = [1];

  if (!showLeftEllipsis && showRightEllipsis) {
    // left is contiguous
    const leftRange = range(2, 2 + siblingCount * 2);
    pages.push(...leftRange);
    pages.push(RANGE_ELLIPSIS);
    pages.push(total);
    return pages;
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(total - (siblingCount * 2 + 1), total - 1);
    pages.push(RANGE_ELLIPSIS);
    pages.push(...rightRange);
    pages.push(total);
    return pages;
  }

  // both ellipses
  pages.push(RANGE_ELLIPSIS);
  pages.push(...range(left, right));
  pages.push(RANGE_ELLIPSIS);
  pages.push(total);
  return pages;
};

const Pagination2 = ({
  totalPages,
  itemsPerPage,
  totalItems,
  initialPage = 1,
  siblingCount = 1,
}) => {

  const router = useRouter();
  const searchParams = useSearchParams();

  // determine initial page from URL param `page` if present
  const pageFromUrl = (() => {
    try {
      const p = parseInt(searchParams?.get('page') || '', 10);
      return Number.isFinite(p) && p >= 1 ? p : null;
    } catch {
      return null;
    }
  })();

  const [current, setCurrent] = useState(pageFromUrl || initialPage);

  // keep current in sync if URL param changes externally
  useEffect(() => {
    const p = pageFromUrl;
    if (p && p !== current) setCurrent(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get('page')]);

  // memoize pagination items
  const pages = useMemo(() => {
    return getPagination(Math.max(1, totalPages || 1), Math.max(1, Math.min(current, totalPages || 1)), siblingCount);
  }, [totalPages, current, siblingCount]);

  // when current changes: update URL param and call callback
  useEffect(() => {
    // update URL param `page` using replace so we don't push new history entries
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (current > 1) {
      params.set('page', String(current));
    } else {
      params.delete('page'); // remove page param for page 1
    }
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : `${window.location.pathname}`;
    router.replace(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const goTo = (page) => {
    const safe = Math.max(1, Math.min(totalPages || 1, page));
    if (safe === current) return;
    setCurrent(safe);
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // UI classes for morphic / neumorphic look
  const baseBtn =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-lg shadow-sm transition-shadow focus:outline-none  focus:ring-[#63953a]';
  const primaryBtn =
    baseBtn + ' bg-gradient-to-b from-white/70 to-slate-100 border border-gray-200 text-sm font-medium';
  const activeBtn =
    baseBtn + ' bg-[#63953a] text-white shadow-md font-semibold ring-1 ring-[#63953a]';
  const ghostBtn = baseBtn + ' bg-white/30 border border-gray-100 text-sm text-gray-700';

  return (
    <nav aria-label="Pagination" className="w-full flex items-center justify-center py-4">
      <div className="w-full max-w-3xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Prev / Next / Buttons */}
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={prev}
              disabled={current <= 1}
              aria-disabled={current <= 1}
              className={`${primaryBtn} ${current <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              <svg className="w-4 h-4 -ml-1 mr-1" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page buttons - large screens (show numbers with ellipses) */}
            <div className="hidden sm:flex items-center gap-2">
              {pages.map((p, idx) => {
                if (p === RANGE_ELLIPSIS) {
                  return (
                    <span
                      key={`ell-${idx}`}
                      className="px-3 h-9 inline-flex items-center justify-center text-sm text-gray-500 select-none"
                    >
                      &#8230;
                    </span>
                  );
                }
                const isActive = p === current;
                return (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    aria-current={isActive ? 'page' : undefined}
                    className={isActive ? activeBtn : primaryBtn + ' hover:shadow-lg'}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Compact page indicator for small screens */}
            <div className="sm:hidden inline-flex items-center gap-2">
              <span className="text-sm text-gray-600 px-3 py-1 rounded-md bg-white/60 border border-gray-100 shadow-sm">
                {current} / {totalPages || 1}
              </span>
            </div>

            {/* Next */}
            <button
              onClick={next}
              disabled={current >= (totalPages || 1)}
              aria-disabled={current >= (totalPages || 1)}
              className={`${primaryBtn} ${current >= (totalPages || 1) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-4 h-4 -mr-1 ml-1" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Right: Page info & items per page (hidden on very small) */}
          <div className="flex items-center gap-3 text-sm text-gray- text-center">
            <div className="inline-flex items-center gap-3">
              <div className="px-3 py-2 min-w-[140px] rounded-lg bg-white/60 border border-gray-100 shadow-sm">
                Page <span className="font-medium mx-1">{current}</span> of <span className="font-medium">{totalPages || 1}</span>
              </div>
              {typeof totalItems === 'number' && (
                <div className="px-3 py-2 min-w-[80px] rounded-lg bg-white/60 border border-gray-100 shadow-sm">
                  {totalItems.toLocaleString()} items
                </div>
              )}
              {typeof itemsPerPage === 'number' && (
                <div className="px-3 py-2 min-w-[80px] rounded-lg bg-white/60 border border-gray-100 shadow-sm">
                  {itemsPerPage} / page
                </div>
              )}
            </div>

            {/* Mobile concise info */}
            {/* <div className=" text-xs text-gray-500">
              {typeof totalItems === 'number' ? `${totalItems.toLocaleString()} items` : `${totalPages || 1} pages`}
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Pagination2;
