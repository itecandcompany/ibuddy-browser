module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(spec|test).(ts|tsx)'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
