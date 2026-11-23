export const palette = {
  background: '#0A1128', surface: '#111B36', surfaceElevated: '#172443', border: '#263657',
  text: '#F5F7FF', textSecondary: '#A8B4CC', muted: '#71809D', blue: '#2D7BFF', violet: '#7C5CFF',
  success: '#32C48D', warning: '#F4B860', danger: '#F16B75', white: '#FFFFFF', black: '#000000',
} as const;
export type PaletteColor = keyof typeof palette;
