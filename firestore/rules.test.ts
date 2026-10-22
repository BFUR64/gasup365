// Firestore rules tests. They need the emulator, so they run with
// `npm run test:rules`, not `npm test`.
import { deleteApp, FirebaseApp, initializeApp } from 'firebase/app';
import {
    addDoc,
    collection,
    connectFirestoreEmulator,
    deleteDoc,
    doc,
    Firestore,
    getDoc,
    getDocs,
    getFirestore,
    serverTimestamp,
    setDoc,
    setLogLevel,
    updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-gasup365';
const [HOST, PORT] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8181').split(':');

// Denied writes are expected here; keep the SDK from logging each one.
setLogLevel('silent');

const apps: FirebaseApp[] = [];

const client = (uid: string | null): Firestore => {
    const app = initializeApp({ projectId: PROJECT_ID, apiKey: 'demo' }, `client-${apps.length}`);
    apps.push(app);
    const db = getFirestore(app);
    connectFirestoreEmulator(db, HOST, Number(PORT), uid ? { mockUserToken: { user_id: uid } } : undefined);
    return db;
};

// The same fields CameraCaptureScreen.share() writes.
const marker = (overrides: Record<string, unknown> = {}) => ({
    latitude: 11.7,
    longitude: 122.37,
    title: 'Petron Kalibo',
    description: 'Roxas Avenue | Diesel P61.90',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/board.jpg',
    imageStorage: 'cloudinary',
    cloudinaryPublicId: 'board',
    prices: { diesel: 61.9, unleaded: null, premium: null },
    source: 'camera-ocr',
    ocr: { parser: 'gasStationParser', rawText: 'DIESEL 61.90', extractedFuels: [], missingFields: {} },
    timestamp: serverTimestamp(),
    ...overrides,
});

// The same fields AuthScreen writes at sign-up.
const profile = (overrides: Record<string, unknown> = {}) => ({
    displayName: 'Alice',
    email: 'alice@example.com',
    createdAt: serverTimestamp(),
    points: 0,
    updates: 0,
    role: 'Community Member',
    ...overrides,
});

const clearData = () =>
    fetch(`http://${HOST}:${PORT}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: 'DELETE' });

let alice: Firestore;
let bob: Firestore;
let guest: Firestore;

beforeAll(() => {
    alice = client('alice');
    bob = client('bob');
    guest = client(null);
});

beforeEach(clearData);

afterAll(async () => {
    await Promise.all(apps.map((app) => deleteApp(app)));
});

describe('markers', () => {
    it('lets a signed-in user share a price exactly as the Scan screen writes it', async () => {
        await expect(addDoc(collection(alice, 'markers'), marker())).resolves.toBeDefined();
    });

    it('accepts a placeholder photo and a userId that matches the writer', async () => {
        await expect(
            addDoc(collection(alice, 'markers'), marker({ imageStorage: 'placeholder', cloudinaryPublicId: null, userId: 'alice' })),
        ).resolves.toBeDefined();
    });

    it('rejects guests', async () => {
        await expect(addDoc(collection(guest, 'markers'), marker())).rejects.toThrow();
        await expect(getDocs(collection(guest, 'markers'))).rejects.toThrow();
    });

    it('rejects a marker with no price, a bad price or an unknown fuel', async () => {
        const markers = collection(alice, 'markers');
        await expect(addDoc(markers, marker({ prices: { diesel: null, unleaded: null, premium: null } }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ prices: { diesel: -1 } }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ prices: { diesel: '61.90' } }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ prices: { diesel: 61.9, kerosene: 70 } }))).rejects.toThrow();
    });

    it('rejects bad coordinates, an empty title, extra fields, a fake timestamp or someone else\'s userId', async () => {
        const markers = collection(alice, 'markers');
        await expect(addDoc(markers, marker({ latitude: 91 }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ title: '' }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ verified: true }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ timestamp: new Date('2020-01-01') }))).rejects.toThrow();
        await expect(addDoc(markers, marker({ userId: 'bob' }))).rejects.toThrow();
    });

    it('lets signed-in users read markers but nobody edit or delete them', async () => {
        const ref = await addDoc(collection(alice, 'markers'), marker());
        await expect(getDoc(doc(bob, 'markers', ref.id))).resolves.toBeDefined();
        await expect(updateDoc(doc(alice, 'markers', ref.id), { title: 'Edited' })).rejects.toThrow();
        await expect(deleteDoc(doc(alice, 'markers', ref.id))).rejects.toThrow();
    });
});

describe('users', () => {
    it('lets a user create and read their own profile exactly as sign-up writes it', async () => {
        await expect(setDoc(doc(alice, 'users', 'alice'), profile())).resolves.toBeUndefined();
        await expect(getDoc(doc(alice, 'users', 'alice'))).resolves.toBeDefined();
    });

    it("blocks reading or creating someone else's profile", async () => {
        await setDoc(doc(alice, 'users', 'alice'), profile());
        await expect(getDoc(doc(bob, 'users', 'alice'))).rejects.toThrow();
        await expect(setDoc(doc(bob, 'users', 'alice'), profile())).rejects.toThrow();
    });

    it('rejects a profile that starts with points or a different role', async () => {
        await expect(setDoc(doc(alice, 'users', 'alice'), profile({ points: 500 }))).rejects.toThrow();
        await expect(setDoc(doc(alice, 'users', 'alice'), profile({ role: 'Admin' }))).rejects.toThrow();
    });

    it('blocks profile edits until FEAT-003', async () => {
        await setDoc(doc(alice, 'users', 'alice'), profile());
        await expect(updateDoc(doc(alice, 'users', 'alice'), { points: 10 })).rejects.toThrow();
    });
});
