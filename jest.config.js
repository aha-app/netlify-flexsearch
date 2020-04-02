module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jestSetup.js"],
  transform: {
    "^.+\\.js?$": "babel-jest",
  },
};
