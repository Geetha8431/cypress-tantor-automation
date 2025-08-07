const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Integrate mochawesome reporter plugin
      require("cypress-mochawesome-reporter/plugin")(on);
    },
    baseUrl: 'https://darch-test.tantor.io/', // Keep your original baseUrl
    experimentalStudio: false,                 // ✅ Disable to prevent accidental reruns
    specPattern: 'cypress/e2e/**/*.cy.js',       // Optional: include only spec files
    
    // Video recording settings
    video: true,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    trashAssetsBeforeRuns: false, // ✅ Clean up old assets
    videoUploadOnPasses: true,

    //Screenshots settings
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
  },

  // 👇 Add mochawesome reporter
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",  // Output folder
    overwrite: false,              // Do not overwrite previous reports
    html: true,                    // Generate HTML reports ✅
    json: false,                    // You can set this true if needed
    // ⚡ Dynamic part here
    reportFilename: `[name]_report`, // [name] will be replaced with spec filename (without extension)
    embeddedScreenshots: true, //Embed screenshots into the report HTML
    inlineAssets: true //Embed screenshots into the report HTML
  
  },
});


