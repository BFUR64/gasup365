import { fromMarker } from '../stationView';

describe('fromMarker', () => {
    it('maps a community update into the sheet view model', () => {
        const view = fromMarker({
            id: 'abc',
            lat: 11.7,
            lng: 122.36,
            title: 'Petron Kalibo',
            description: 'Roxas Avenue, Kalibo | Diesel P61.90',
            imageUrl: 'https://res.cloudinary.com/demo/board.jpg',
            prices: { diesel: 61.9, unleaded: null },
        });

        expect(view).toMatchObject({
            id: 'abc',
            name: 'Petron Kalibo',
            address: 'Roxas Avenue, Kalibo',
            source: 'community',
            prices: { diesel: 61.9, unleaded: null, premium: null },
            coordinates: { latitude: 11.7, longitude: 122.36 },
            photoUrl: 'https://res.cloudinary.com/demo/board.jpg',
        });
        expect(view.score).toBeUndefined();
    });

    it('drops the placeholder image so the sheet shows "No photo"', () => {
        const view = fromMarker({
            id: 'p',
            lat: 0,
            lng: 0,
            title: 'Typed by hand',
            imageUrl: 'https://placehold.co/640x480/F97316/FFFFFF?text=GasUp365',
        });
        expect(view.photoUrl).toBeUndefined();
        expect(view.address).toBeUndefined();
    });
});
