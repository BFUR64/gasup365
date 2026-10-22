// Original pixel art for GasUp365 as rect-based SVG path data. Plain data (no
// React Native imports) so the same art draws native sprites and map-pin HTML.

export type PixelLayer = readonly [fill: string, d: string];

export interface PixelArt {
    width: number;
    height: number;
    layers: readonly PixelLayer[];
}

const OUTLINE = '#3B1A08';

export const art = {
    cloud: {
        width: 16,
        height: 6,
        layers: [
            [OUTLINE, 'M5 0h4v1h-4zM3 1h2v1h-2zM9 1h1v1h-1zM11 1h2v1h-2zM2 2h1v1h-1zM10 2h1v1h-1zM13 2h2v1h-2zM1 3h1v1h-1zM14 3h1v1h-1zM0 4h1v1h-1zM15 4h1v1h-1zM1 5h14v1h-14z'],
            ['#FFFDF9', 'M5 1h4v1h-4zM3 2h7v1h-7zM11 2h2v1h-2zM2 3h12v1h-12zM1 4h14v1h-14z'],
        ],
    },
    palm: {
        width: 12,
        height: 15,
        layers: [
            ['#3E8E41', 'M3 0h2v1h-2zM8 0h2v1h-2zM1 1h2v1h-2zM5 1h1v2h-1zM7 1h1v2h-1zM10 1h2v1h-2zM0 2h1v2h-1zM4 3h1v1h-1zM8 3h1v1h-1zM11 3h1v1h-1zM3 4h2v1h-2zM8 4h2v1h-2zM2 5h1v1h-1zM10 5h1v1h-1z'],
            ['#6CCB5F', 'M3 1h2v1h-2zM8 1h2v1h-2zM1 2h2v1h-2zM6 2h1v1h-1zM10 2h2v1h-2zM5 3h3v1h-3z'],
            ['#A8876A', 'M6 4h1v3h-1zM5 7h1v3h-1zM5 10h2v1h-2zM6 11h1v3h-1zM5 14h3v1h-3z'],
        ],
    },
    nipaHut: {
        width: 16,
        height: 12,
        layers: [
            [OUTLINE, 'M7 0h2v1h-2zM5 1h2v1h-2zM9 1h2v1h-2zM3 2h2v1h-2zM11 2h2v1h-2zM1 3h2v1h-2zM13 3h2v1h-2zM0 4h1v1h-1zM15 4h1v1h-1zM0 5h16v1h-16zM1 6h1v5h-1zM14 6h1v5h-1zM4 7h3v1h-3zM11 7h2v1h-2zM3 8h1v1h-1zM6 8h1v1h-1zM11 8h1v2h-1zM4 9h3v1h-3zM12 10h1v1h-1zM1 11h14v1h-14z'],
            ['#A8876A', 'M7 1h2v1h-2zM5 2h6v1h-6zM3 3h10v1h-10zM1 4h14v1h-14z'],
            ['#FFFDF9', 'M2 6h12v1h-12zM2 7h2v1h-2zM7 7h4v3h-4zM13 7h1v1h-1zM2 8h1v1h-1zM12 8h2v2h-2zM2 9h2v1h-2zM2 10h10v1h-10zM13 10h1v1h-1z'],
            ['#8FD3FF', 'M4 8h2v1h-2z'],
        ],
    },
    church: {
        width: 16,
        height: 16,
        layers: [
            [OUTLINE, 'M7 0h1v1h-1zM6 1h3v1h-3zM7 2h1v1h-1zM6 3h3v1h-3zM5 4h1v2h-1zM9 4h1v2h-1zM4 6h1v2h-1zM10 6h1v1h-1zM6 7h3v1h-3zM11 7h1v1h-1zM2 8h3v1h-3zM11 8h3v1h-3zM1 9h1v1h-1zM14 9h1v1h-1zM0 10h1v5h-1zM15 10h1v5h-1zM4 11h1v2h-1zM11 11h1v2h-1zM7 12h2v3h-2zM0 15h16v1h-16z'],
            ['#FFFDF9', 'M6 4h3v2h-3zM5 6h5v1h-5zM5 7h1v1h-1zM9 7h2v1h-2zM5 8h6v1h-6zM2 9h12v1h-12zM1 10h14v1h-14zM1 11h3v2h-3zM5 11h6v1h-6zM12 11h3v2h-3zM5 12h2v1h-2zM9 12h2v1h-2zM1 13h6v2h-6zM9 13h6v2h-6z'],
        ],
    },
    jeepney: {
        width: 32,
        height: 15,
        layers: [
            [OUTLINE, 'M2 0h23v1h-23zM1 1h1v1h-1zM25 1h1v1h-1zM1 2h25v1h-25zM1 3h1v1h-1zM25 3h2v1h-2zM1 4h1v3h-1zM5 4h1v3h-1zM9 4h1v3h-1zM13 4h1v3h-1zM17 4h1v3h-1zM21 4h1v3h-1zM25 4h1v3h-1zM27 4h2v1h-2zM29 5h1v1h-1zM30 6h2v1h-2zM1 7h1v5h-1zM31 8h1v4h-1zM6 11h1v1h-1zM11 11h1v1h-1zM22 11h1v1h-1zM27 11h1v1h-1zM1 12h6v1h-6zM11 12h11v1h-11zM26 12h6v1h-6z'],
            ['#FFD54A', 'M2 1h23v1h-23zM28 9h3v1h-3z'],
            ['#E8E1D8', 'M2 3h23v1h-23zM26 4h1v3h-1zM2 7h29v1h-29zM2 11h4v1h-4zM12 11h10v1h-10zM28 11h3v1h-3z'],
            ['#8FD3FF', 'M2 4h3v3h-3zM6 4h3v3h-3zM10 4h3v3h-3zM14 4h3v3h-3zM18 4h3v3h-3zM22 4h3v3h-3zM27 5h2v1h-2zM27 6h3v1h-3z'],
            ['#F97316', 'M31 7h1v1h-1z'],
            ['#D7263D', 'M2 8h29v1h-29zM2 10h29v1h-29z'],
            ['#4A90E2', 'M2 9h26v1h-26z'],
            ['#1F2933', 'M7 11h4v1h-4zM23 11h4v1h-4zM7 12h1v1h-1zM10 12h1v1h-1zM22 12h1v1h-1zM25 12h1v1h-1zM6 13h1v1h-1zM10 13h1v1h-1zM22 13h1v1h-1zM26 13h1v1h-1zM7 14h3v1h-3zM23 14h3v1h-3z'],
            ['#9CA3AF', 'M8 12h2v1h-2zM23 12h2v1h-2zM7 13h3v1h-3zM23 13h3v1h-3z'],
        ],
    },
    station: {
        width: 24,
        height: 14,
        layers: [
            [OUTLINE, 'M0 0h24v1h-24zM0 1h1v2h-1zM23 1h1v2h-1zM0 3h24v1h-24zM2 4h2v9h-2zM18 4h2v9h-2zM8 5h6v1h-6zM8 6h1v1h-1zM13 6h1v1h-1zM8 7h6v1h-6zM15 7h1v1h-1zM8 8h1v4h-1zM13 8h1v4h-1zM16 8h1v2h-1zM14 10h2v1h-2zM7 12h8v1h-8zM0 13h24v1h-24z'],
            ['#F97316', 'M1 1h22v1h-22zM9 8h4v4h-4z'],
            ['#FFD54A', 'M1 2h22v1h-22z'],
            ['#FFFFFF', 'M9 6h4v1h-4z'],
        ],
    },
    brokenStation: {
        width: 24,
        height: 14,
        layers: [
            [OUTLINE, 'M0 0h24v1h-24zM0 1h1v2h-1zM23 1h1v2h-1zM0 3h24v1h-24zM2 4h2v9h-2zM18 4h2v9h-2zM8 5h6v1h-6zM8 6h1v1h-1zM13 6h1v1h-1zM8 7h6v1h-6zM8 8h1v4h-1zM13 8h1v4h-1zM7 12h8v1h-8zM0 13h24v1h-24z'],
            ['#6B7280', 'M1 1h22v1h-22zM9 8h4v4h-4z'],
            ['#D9C6B3', 'M1 2h22v1h-22z'],
            ['#FFFFFF', 'M9 6h4v1h-4z'],
        ],
    },
    avatar: {
        width: 16,
        height: 16,
        layers: [
            [OUTLINE, 'M4 0h8v1h-8zM3 1h1v2h-1zM12 1h1v2h-1zM3 3h12v1h-12zM3 4h1v4h-1zM12 4h1v4h-1zM4 8h1v1h-1zM11 8h1v1h-1zM5 9h2v1h-2zM9 9h2v1h-2zM2 10h1v1h-1zM13 10h1v1h-1zM1 11h1v4h-1zM14 11h1v4h-1zM1 15h14v1h-14z'],
            ['#F97316', 'M4 1h8v1h-8zM4 2h2v1h-2zM8 2h4v1h-4z'],
            ['#FFD54A', 'M6 2h2v1h-2zM7 11h1v2h-1z'],
            ['#E0A878', 'M4 4h8v1h-8zM4 5h1v1h-1zM6 5h4v1h-4zM11 5h1v1h-1zM4 6h8v1h-8zM4 7h3v1h-3zM9 7h3v1h-3zM5 8h6v1h-6zM7 9h2v1h-2z'],
            ['#1F2933', 'M5 5h1v1h-1zM10 5h1v1h-1z'],
            ['#7A2E0B', 'M7 7h2v1h-2z'],
            ['#2FA84F', 'M3 10h10v1h-10zM2 11h5v2h-5zM8 11h6v2h-6zM2 13h12v2h-12z'],
        ],
    },
    hills: {
        width: 130,
        height: 24,
        layers: [
            ['#3E8E41', 'M0 14h8v-2h6v-3h8v-3h6v2h6v3h8v-4h6v-3h8v2h6v4h8v2h8v-3h6v-3h8v3h6v4h8v-2h8v3h6v14h-130z'],
            ['#2F6E32', 'M0 20h130v4h-130z'],
        ],
    },
    crown: {
        width: 10,
        height: 6,
        layers: [
            [OUTLINE, 'M0 0h1v1h-1zM4 0h2v1h-2zM9 0h1v1h-1zM0 1h1v1h-1zM3 1h1v1h-1zM6 1h1v1h-1zM9 1h1v1h-1zM0 2h1v1h-1zM3 2h1v1h-1zM6 2h1v1h-1zM9 2h1v1h-1zM0 3h1v1h-1zM9 3h1v1h-1zM0 4h1v1h-1zM9 4h1v1h-1zM0 5h10v1h-10z'],
            ['#FFD54A', 'M1 1h1v1h-1zM4 1h2v1h-2zM8 1h1v1h-1zM1 2h2v1h-2zM4 2h2v1h-2zM7 2h2v1h-2zM1 3h8v1h-8zM1 4h1v1h-1zM4 4h2v1h-2zM8 4h1v1h-1z'],
            ['#D7263D', 'M2 4h2v1h-2zM6 4h2v1h-2z'],
        ],
    },
    you: {
        width: 10,
        height: 10,
        layers: [
            [OUTLINE, 'M2 0h6v1h-6zM1 1h1v1h-1zM8 1h1v1h-1zM0 2h1v6h-1zM9 2h1v6h-1zM1 8h1v1h-1zM8 8h1v1h-1zM2 9h6v1h-6z'],
            ['#FFFFFF', 'M2 1h6v1h-6zM1 2h8v6h-8zM2 8h6v1h-6z'],
            ['#4A90E2', 'M3 2h4v1h-4zM2 3h6v4h-6zM3 7h4v1h-4z'],
        ],
    },
} satisfies Record<string, PixelArt>;

const COIN_OUTLINE = 'M3 0h6v1h-6zM1 1h2v1h-2zM9 1h2v1h-2zM1 2h1v1h-1zM10 2h1v1h-1zM0 3h1v6h-1zM11 3h1v6h-1zM4 3h3v1h-3zM4 4h1v1h-1zM7 4h1v1h-1zM3 5h5v1h-5zM4 6h3v1h-3zM4 7h1v2h-1zM1 9h1v1h-1zM10 9h1v1h-1zM1 10h2v1h-2zM9 10h2v1h-2zM3 11h6v1h-6z';
const COIN_FILL = 'M3 1h6v1h-6zM2 2h8v1h-8zM1 3h3v1h-3zM7 3h4v1h-4zM1 4h3v1h-3zM5 4h2v1h-2zM8 4h3v1h-3zM1 5h2v1h-2zM8 5h3v1h-3zM1 6h3v1h-3zM7 6h4v1h-4zM1 7h3v2h-3zM5 7h6v2h-6zM2 9h8v1h-8zM3 10h6v1h-6z';

export const coinArt = (fill = '#FFD54A'): PixelArt => ({
    width: 12,
    height: 12,
    layers: [[OUTLINE, COIN_OUTLINE], [fill, COIN_FILL]],
});

export const pumpPinArt = (fill: string): PixelArt => ({
    width: 16,
    height: 17,
    layers: [
        [OUTLINE, 'M1 0h14v1h-14zM0 1h1v11h-1zM15 1h1v11h-1zM1 12h14v1h-14zM6 13h1v3h-1zM9 13h1v3h-1zM7 16h2v1h-2z'],
        [fill, 'M1 1h14v11h-14z'],
        [OUTLINE, 'M4 2h6v1h-6zM4 3h1v2h-1zM9 3h1v2h-1zM12 3h1v1h-1zM13 4h1v4h-1zM12 7h1v1h-1zM4 5h6v3h-6zM4 8h8v1h-8zM4 9h6v1h-6zM3 10h8v1h-8zM7 13h2v3h-2z'],
        ['#FFD54A', 'M5 3h4v2h-4z'],
    ],
});

// SVG markup for places that need an HTML string (Leaflet pins). Every value
// interpolated here comes from the constant art above, never from user data.
export const artToSvg = (pixelArt: PixelArt, width: number, height: number) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pixelArt.width} ${pixelArt.height}" width="${width}" height="${height}" shape-rendering="crispEdges" aria-hidden="true">${pixelArt.layers
        .map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`)
        .join('')}</svg>`;
