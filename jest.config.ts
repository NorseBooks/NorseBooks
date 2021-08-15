import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/src/services/**/*.spec.ts'],
  globalSetup: './src/services/test-setup.ts',
  testTimeout: 30000,
  collectCoverage: true,
  coverageReporters: ['json-summary', 'lcov'],
  collectCoverageFrom: ['./src/services/*'],
};

export default config;
