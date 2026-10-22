import type { TextStyle } from 'react-native';

// Font family names as registered by useFonts in src/app/_layout.tsx.
// Custom fonts carry their own weight, so styles never set fontWeight.
export const fonts = {
    display500: 'PixelifySans_500Medium',
    display600: 'PixelifySans_600SemiBold',
    display700: 'PixelifySans_700Bold',
    tag: 'Silkscreen_400Regular',
    body600: 'Nunito_600SemiBold',
    body700: 'Nunito_700Bold',
    body800: 'Nunito_800ExtraBold',
};

// Type scale (DESIGN-002 §5.4).
export const type = {
    priceHero: { fontFamily: fonts.display700, fontSize: 40, lineHeight: 44 },
    priceLg: { fontFamily: fonts.display700, fontSize: 28, lineHeight: 32 },
    displayLg: { fontFamily: fonts.display700, fontSize: 28, lineHeight: 32 },
    displayMd: { fontFamily: fonts.display600, fontSize: 22, lineHeight: 28 },
    displaySm: { fontFamily: fonts.display600, fontSize: 18, lineHeight: 24 },
    bodyLg: { fontFamily: fonts.body700, fontSize: 16, lineHeight: 24 },
    bodyMd: { fontFamily: fonts.body600, fontSize: 14, lineHeight: 20 },
    bodyStrong: { fontFamily: fonts.body800, fontSize: 14, lineHeight: 20 },
    caption: { fontFamily: fonts.body700, fontSize: 12, lineHeight: 16 },
    captionStrong: { fontFamily: fonts.body800, fontSize: 12, lineHeight: 16 },
    tag: {
        fontFamily: fonts.tag,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
} satisfies Record<string, TextStyle>;

const drop = '0px 4px 0px rgba(59, 26, 8, 0.35)';

// Hard (0-blur) bevels and shadows for the PixelPanel family (§5.2, §5.6).
export const shadow = {
    drop,
    up: '0px -4px 0px rgba(59, 26, 8, 0.35)',
    panel: `inset -2px -2px 0px #EADBCB, ${drop}`,
    slot: 'inset 2px 2px 0px #E3D3C2, inset -2px -2px 0px #FFFFFF',
    slotFlat: 'inset 2px 2px 0px #E3D3C2',
    primary: `inset 2px 2px 0px #FFB066, inset -2px -2px 0px #C2410C, ${drop}`,
    primaryFlat: 'inset 2px 2px 0px #FFB066, inset -2px -2px 0px #C2410C',
    secondary: `inset 2px 2px 0px #FFFFFF, inset -2px -2px 0px #E3D3C2, ${drop}`,
    danger: `inset 2px 2px 0px #F06B6B, inset -2px -2px 0px #9B1C1C, ${drop}`,
    reward: `inset 2px 2px 0px #FFF0B3, inset -2px -2px 0px #C79A00, ${drop}`,
    selectedFuel: `inset 0px 0px 0px 2px #FFD54A, ${drop}`,
    selectedSlot: 'inset 0px 0px 0px 2px #FFD54A',
    pressed: 'inset 2px 2px 0px rgba(59, 26, 8, 0.18)',
};

export const space = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40, s12: 48 };

export const WIDE_BREAKPOINT = 1024;
