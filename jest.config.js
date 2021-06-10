const baseConfig = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.ts', '**/*.tsx', '!**/*.d.ts', '!cdk.out/**/*', '!bin/**/*', '!esbuild.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
};

module.exports = {
  projects: [
    { ...baseConfig, displayName: 'dom', testEnvironment: 'jsdom', testMatch: ['**/*.test.tsx'] },
    { ...baseConfig, displayName: 'node', testEnvironment: 'node', testMatch: ['**/*.test.ts'] },
  ],
};
