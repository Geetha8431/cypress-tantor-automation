const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Integrate mochawesome reporter plugin
      require("cypress-mochawesome-reporter/plugin")(on);
    },
    baseUrl: 'https://darch-test.tantor.io/', // Keep your original baseUrl
    experimentalStudio: true,                 // Preserve experimentalStudio
    specPattern: 'cypress/e2e/**/*.cy.js',       // Optional: include only spec files
    // Video recording settings
    video: true,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    trashAssetsBeforeRuns: false,
    // Additional video settings
    videoUploadOnPasses: true,
    screenshotOnRunFailure: true,
  },

  // 👇 Add mochawesome reporter
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",  // Output folder
    overwrite: false,              // Do not overwrite previous reports
    html: true,                    // Generate HTML reports ✅
    json: false                    // You can set this true if needed
  },

  // ✅ Video settings (keep your original)
  video: true,
  videoCompression: 32,
  videosFolder: "cypress/videos",
  trashAssetsBeforeRuns: false,
});


