import { art, artToSvg, pumpPinArt } from '../ui/pixelArt';

export interface MapPin {
    id: string;
    lat: number;
    lng: number;
    title: string;
    html: string;
    size: [number, number];
    anchor: [number, number];
    zIndexOffset: number;
}

interface PinOptions {
    id: string;
    lat: number;
    lng: number;
    title: string;
    label: string | null;
    community: boolean;
    best: boolean;
    selected: boolean;
}

export const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const PIN_WIDTH = 88;
const CROWN_HEIGHT = 12;
const BUBBLE_HEIGHT = 24;
const GAP = 2;

// Builds the Leaflet divIcon markup for one station. Only `label` comes from
// data, and it is escaped; the art and colours are constants.
export const buildPin = ({ id, lat, lng, title, label, community, best, selected }: PinOptions): MapPin => {
    const spriteWidth = selected ? 44 : 32;
    const spriteHeight = selected ? 47 : 34;
    const bubbleClass = label ? (selected ? 'gu-bubble gu-selected' : best ? 'gu-bubble gu-best' : 'gu-bubble') : 'gu-bubble gu-empty';
    const crown = best ? `<span class="gu-crown">${artToSvg(art.crown, 20, 12)}</span>` : '<span class="gu-crown"></span>';
    const sprite = artToSvg(pumpPinArt(community ? '#F97316' : '#FFFFFF'), spriteWidth, spriteHeight);
    const height = CROWN_HEIGHT + GAP + BUBBLE_HEIGHT + GAP + spriteHeight;

    return {
        id,
        lat,
        lng,
        title,
        html: `<div class="gu-pin-inner">${crown}<span class="${bubbleClass}">${escapeHtml(label ?? '—')}</span>${sprite}</div>`,
        size: [PIN_WIDTH, height],
        anchor: [PIN_WIDTH / 2, height],
        zIndexOffset: selected ? 1000 : best ? 500 : 0,
    };
};

export const USER_MARKER_HTML = artToSvg(art.you, 30, 30);

// Styles for the pin markup, injected into the map document.
export const PIN_CSS = `
.gu-pin{background:none;border:0}
.gu-pin-inner{width:${PIN_WIDTH}px;display:flex;flex-direction:column;align-items:center;gap:${GAP}px}
.gu-crown{height:${CROWN_HEIGHT}px;display:block}
.gu-crown svg{display:block;animation:gu-bob .6s steps(1) infinite}
.gu-bubble{height:${BUBBLE_HEIGHT}px;box-sizing:border-box;padding:0 6px;border:2px solid #3B1A08;background:#FFFFFF;color:#1F2933;font:16px/20px 'PixelifySans_700Bold','Pixelify Sans',system-ui,sans-serif;font-weight:700;white-space:nowrap;box-shadow:0 2px 0 rgba(59,26,8,.35)}
.gu-best{background:#FFD54A}
.gu-selected{background:#F97316}
.gu-empty{background:#F8F2EC;border-style:dashed;opacity:.75}
.gu-pin-inner>svg{display:block}
.leaflet-tile-pane{filter:saturate(.85) sepia(.12)}
.leaflet-container{background:#EFE6D6;font-family:system-ui,sans-serif}
@keyframes gu-bob{0%,49%{transform:translateY(0)}50%,100%{transform:translateY(-2px)}}
@media (prefers-reduced-motion: reduce){.gu-crown svg{animation:none}}
`;
