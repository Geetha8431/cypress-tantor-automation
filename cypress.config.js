const { defineConfig } = require("cypress");
const today = new Date().toISOString().slice(0, 10);

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: `cypress/runs/${today}/reports`,
    reportFilename: `[name]_report`,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: false,
    html: true,
    json: true,
    copyVideos: false,
  },

  e2e: {
    video: true,
    videosFolder: `cypress/runs/${today}/videos`,
    screenshotsFolder: `cypress/runs/${today}/screenshots`,

    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
  },
});
