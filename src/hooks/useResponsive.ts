import { useWindowDimensions } from 'react-native';

export interface ResponsiveConfig {
  width: number;
  height: number;
  columns: 1 | 2;
  iconSize: number;
  headerIconSize: number;
  tileSize: number;
  pagePad: number;
  columnGap: number;
  rowGap: number;
  searchHeight: number;
  searchIconSize: number;
  filterSize: number;
  cardPadding: number;
  cardRadius: number;
  pillHeight: number;
  pillDotSize: number;
  fabWidth: number;
  fabHeight: number;
  fabIconCircle: number;
  fabPlusSize: number;
  fabTextSize: number;
  sectionTitleSize: number;
  cardTitleSize: number;
  linkCountSize: number;
  categorySize: number;
}

export function useResponsive(): ResponsiveConfig {
  const { width, height } = useWindowDimensions();

  const isSmall = width < 360;
  const isNormal = width >= 360 && width < 412;
  const isLarge = width >= 412;

  // Columns
  const columns: 1 | 2 = isSmall ? 1 : 2;

  // Icon sizes (spec: small 18-20, normal 20-22, large 22-24)
  const iconSize = isSmall ? 18 : isNormal ? 20 : 22;
  const headerIconSize = isSmall ? 20 : isNormal ? 24 : 28;

  // Tile sizes
  const tileSize = isSmall ? 36 : isNormal ? 42 : 48;

  // Page padding (spec: 20-24px, scale down on small)
  const pagePad = isSmall ? 16 : isNormal ? 20 : 24;

  // Grid gaps
  const columnGap = isSmall ? 10 : isNormal ? 14 : 16;
  const rowGap = isSmall ? 12 : isNormal ? 16 : 18;

  // Search bar
  const searchHeight = isSmall ? 46 : isNormal ? 50 : 54;
  const searchIconSize = isSmall ? 16 : isNormal ? 17 : 18;
  const filterSize = isSmall ? 30 : isNormal ? 34 : 36;

  // Card
  const cardPadding = isSmall ? 16 : isNormal ? 18 : 22;
  const cardRadius = isSmall ? 20 : isNormal ? 24 : 28;

  // Category pill
  const pillHeight = isSmall ? 32 : isNormal ? 36 : 40;
  const pillDotSize = isSmall ? 8 : isNormal ? 9 : 10;

  // FAB
  const fabWidth = isSmall ? 170 : isNormal ? 190 : 210;
  const fabHeight = isSmall ? 50 : isNormal ? 54 : 58;
  const fabIconCircle = isSmall ? 34 : isNormal ? 38 : 40;
  const fabPlusSize = isSmall ? 20 : isNormal ? 22 : 24;
  const fabTextSize = isSmall ? 15 : isNormal ? 16 : 17;

  // Typography
  const sectionTitleSize = isSmall ? 22 : isNormal ? 25 : 27;
  const cardTitleSize = isSmall ? 16 : isNormal ? 17 : 19;
  const linkCountSize = isSmall ? 13 : isNormal ? 14 : 16;
  const categorySize = isSmall ? 12 : isNormal ? 13 : 15;

  return {
    width,
    height,
    columns,
    iconSize,
    headerIconSize,
    tileSize,
    pagePad,
    columnGap,
    rowGap,
    searchHeight,
    searchIconSize,
    filterSize,
    cardPadding,
    cardRadius,
    pillHeight,
    pillDotSize,
    fabWidth,
    fabHeight,
    fabIconCircle,
    fabPlusSize,
    fabTextSize,
    sectionTitleSize,
    cardTitleSize,
    linkCountSize,
    categorySize,
  };
}