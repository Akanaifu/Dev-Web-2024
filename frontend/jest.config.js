/** @type {import("jest").Config} **/
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "html"],
  transformIgnorePatterns: ["node_modules/(?!@angular|rxjs|zone.js)"],
};
