const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "html"],
  transform: {
    "^.+\\.(ts|js|html)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.spec.json",
        stringifyContentPathRegex: "\\.html$",
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!@angular|rxjs|zone.js)"],
};
