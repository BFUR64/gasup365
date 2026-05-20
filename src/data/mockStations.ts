import { Station } from '../types';

export const kaliboCenter = {
    latitude: 11.7089,
    longitude: 122.364,
};

export const stations: Station[] = [
    {
        id: 1,
        name: "Petron - Kalibo",
        address: "Roxas Avenue, Kalibo, Aklan",
        distance: 0.7,
        lastUpdated: "Live now",
        prices: { diesel: 61.9, unleaded: 64.8, premium: 73.6 },
        mapPosition: { x: 46, y: 42 },
        coordinates: { latitude: 11.7052, longitude: 122.3661 },
    },
    {
        id: 2,
        name: "Shell - Kalibo Crossing",
        address: "Kalibo Crossing, Kalibo, Aklan",
        distance: 1.1,
        lastUpdated: "3 min ago",
        prices: { diesel: 62.4, unleaded: 65.1, premium: 74.2 },
        mapPosition: { x: 58, y: 35 },
        coordinates: { latitude: 11.7084, longitude: 122.3609 },
    },
    {
        id: 3,
        name: "Caltex - Andagao",
        address: "Andagao, Kalibo, Aklan",
        distance: 1.8,
        lastUpdated: "6 min ago",
        prices: { diesel: 61.5, unleaded: 64.3, premium: 73.9 },
        mapPosition: { x: 36, y: 62 },
        coordinates: { latitude: 11.7008, longitude: 122.3694 },
    },
    {
        id: 4,
        name: "Phoenix - Estancia",
        address: "Estancia, Kalibo, Aklan",
        distance: 2.4,
        lastUpdated: "9 min ago",
        prices: { diesel: 62.1, unleaded: 65.5, premium: 75.1 },
        mapPosition: { x: 67, y: 56 },
        coordinates: { latitude: 11.712, longitude: 122.3713 },
    },
];
