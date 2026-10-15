/**
 * useResponsive — Stud Responsive Layout Hook
 * Provides breakpoint values derived from useWindowDimensions.
 * Desktop: width >= 768px (persistent sidebar, 3-column grid)
 * Mobile:  width <  768px (drawer sidebar, stacked single column)
 */

import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  screenWidth: number;
  screenHeight: number;
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  /** Number of columns for multi-column grids */
  gridColumns: number;
  /** Horizontal padding scaled to screen width */
  pagePadding: number;
}

export const useResponsive = (): ResponsiveLayout => {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  return {
    screenWidth: width,
    screenHeight: height,
    isDesktop,
    isMobile,
    isTablet,
    gridColumns: isDesktop ? 3 : isTablet ? 2 : 1,
    pagePadding: isMobile ? 16 : isTablet ? 20 : 24,
  };
};
