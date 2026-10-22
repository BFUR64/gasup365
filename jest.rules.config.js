// Firestore rules tests (firestore/*.test.ts). Run through the emulator with
// `npm run test:rules`; the main jest.config.js only runs __tests__ folders.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/firestore/**/*.test.ts'],
  testTimeout: 20000,
};
