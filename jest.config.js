module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/packages/core/src/$1",
    "^@motion/(.*)$": "<rootDir>/packages/motion/src/$1"
  }
};
