import { Station } from '../types';

export const stations: Station[] = [
    {
        id: 1,
        name: "Petron - Commonwealth",
        address: "Commonwealth Ave, Quezon City",
        distance: 0.8,
        lastUpdated: "5 min ago",
        prices: { diesel: 62.5, unleaded: 65.2, premium: 75.8 },
        mapPosition: { x: 35, y: 45 }
    },
    {
        id: 2,
        name: "Shell - Tandang Sora",
        address: "Tandang Sora Ave, Quezon City",
        distance: 1.2,
        lastUpdated: "12 min ago",
        prices: { diesel: 63.0, unleaded: 66.0, premium: 77.2 },
        mapPosition: { x: 60, y: 30 }
    },
    {
        id: 3,
        name: "Caltex - Mindanao Ave",
        address: "Mindanao Ave, Quezon City",
        distance: 2.1,
        lastUpdated: "8 min ago",
        prices: { diesel: 61.8, unleaded: 64.5, premium: 74.9 },
        mapPosition: { x: 20, y: 70 }
    }
];