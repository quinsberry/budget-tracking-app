import type { Config } from 'jest';

const config: Config = {
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};

export default config;