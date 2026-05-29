import { useCallback, useEffect, useState } from 'react';

const MD_BREAKPOINT = 768;

export function useResponsiveSidebar(defaultDesktopOpen = true) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MD_BREAKPOINT : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth >= MD_BREAKPOINT && defaultDesktopOpen
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const onChange = () => {
      const mobile = !mq.matches;
      setIsMobile(mobile);
      setSidebarOpen(mobile ? false : defaultDesktopOpen);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [defaultDesktopOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);
  const closeSidebar = useCallback(() => {
    setSidebarOpen((open) => (isMobile ? false : open));
  }, [isMobile]);

  return { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar, closeSidebar };
}
