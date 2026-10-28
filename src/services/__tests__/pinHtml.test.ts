import { buildPin, escapeHtml } from '../pinHtml';

const basePin = { id: 'a', lat: 11.7, lng: 122.36, title: 'Petron', community: false, best: false, selected: false };

describe('buildPin', () => {
    it('escapes community-supplied labels so markup cannot be injected', () => {
        const pin = buildPin({ ...basePin, label: '<img src=x onerror=alert(1)>' });
        expect(pin.html).not.toContain('<img');
        expect(pin.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(escapeHtml(`"'&`)).toBe('&quot;&#039;&amp;');
    });

    it('anchors the pin at its bottom centre', () => {
        const pin = buildPin({ ...basePin, label: '₱61.90' });
        expect(pin.anchor).toEqual([pin.size[0] / 2, pin.size[1]]);
    });

    it('marks the best pick with a crown and the selected pin as larger and on top', () => {
        const best = buildPin({ ...basePin, label: '₱61.90', best: true });
        const selected = buildPin({ ...basePin, label: '₱61.90', selected: true });
        expect(best.html).toContain('gu-best');
        expect(best.html).toContain('<svg');
        expect(selected.html).toContain('gu-selected');
        expect(selected.size[1]).toBeGreaterThan(best.size[1]);
        expect(selected.zIndexOffset).toBeGreaterThan(best.zIndexOffset);
    });

    it('shows a dashed "—" bubble when the station has no price for the fuel', () => {
        expect(buildPin({ ...basePin, label: null }).html).toContain('gu-empty">—<');
    });
});
