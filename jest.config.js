module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(spec|test).(ts|tsx)'],
  clearMocks: true,
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
