/** @type {import("jest").Config} **/
module.exports = {
  // Configuration de base
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testRegex: '\\.test\\.ts$',
  
  // Extensions de fichiers
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Transformation des fichiers
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Configuration TypeScript inline
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es5',
        module: 'commonjs',
        experimentalDecorators: true,
        emitDecoratorMetadata: true
      }
    }
  },
  
  // Ignorer TOUS les node_modules
  transformIgnorePatterns: [
    'node_modules'
  ],
  
  // Mock de tous les modules problématiques
  moduleNameMapper: {
    '^@angular/core$': '<rootDir>/__mocks__/@angular/core.js',
    '^@angular/common/http$': '<rootDir>/__mocks__/@angular/common/http.js',
    '^rxjs$': '<rootDir>/__mocks__/rxjs.js',
    '^is-generator-fn$': '<rootDir>/__mocks__/simple.js',
    '^slash$': '<rootDir>/__mocks__/simple.js',
    '^p-limit$': '<rootDir>/__mocks__/simple.js',
    '^yocto-queue$': '<rootDir>/__mocks__/simple.js'
  },
  
  // Setup minimal
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  
  // Options
  verbose: true,
  testTimeout: 10000,
  
  // Pas de couverture
  collectCoverage: false
};
