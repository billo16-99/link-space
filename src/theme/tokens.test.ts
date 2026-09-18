import { palettes, spacing, radius, type, resolveAppearance, type Palette } from './tokens';

describe('theme tokens', () => {
  it('dark and light palettes expose the same keys', () => {
    const darkKeys = Object.keys(palettes.dark).sort();
    const lightKeys = Object.keys(palettes.light).sort();
    expect(darkKeys).toEqual(lightKeys);
  });

  it('core palette entries exist in both modes', () => {
    for (const palette of Object.values(palettes) as Palette[]) {
      expect(palette.background).toBeTruthy();
      expect(palette.surface).toBeTruthy();
      expect(palette.border).toBeTruthy();
      expect(palette.textPrimary).toBeTruthy();
      expect(palette.textSecondary).toBeTruthy();
      expect(palette.accent).toBeTruthy();
      expect(palette.danger).toBeTruthy();
    }
  });

  it('dark mode uses a near-black background', () => {
    expect(palettes.dark.background).toBe('#0B0B0D');
  });

  it('spacing values are all positive', () => {
    for (const value of Object.values(spacing) as number[]) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it('radius values are all non-negative', () => {
    for (const value of Object.values(radius) as number[]) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it('type scale defines the required text styles', () => {
    expect(type.title.fontSize).toBeGreaterThan(type.heading.fontSize);
    expect(type.heading.fontSize).toBeGreaterThan(type.body.fontSize);
  });
});

describe('resolveAppearance', () => {
  it('respects an explicit dark mode', () => {
    expect(resolveAppearance('dark', 'light')).toBe('dark');
  });

  it('respects an explicit light mode', () => {
    expect(resolveAppearance('light', 'dark')).toBe('light');
  });

  it('delegates to the system when mode is system', () => {
    expect(resolveAppearance('system', 'dark')).toBe('dark');
    expect(resolveAppearance('system', 'light')).toBe('light');
  });
});