// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

import 'cypress-mochawesome-reporter/register';

require('cypress-xpath');

afterEach(function () {
  if (this.currentTest.state === "passed") {
    const fileName = this.currentTest.title.replace(/[^a-z0-9]/gi, "_");
    cy.screenshot(`PASSED_${fileName}`);
  }
});


Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("expected expression, got '<'") ||
    err.message.includes("ace/theme") ||
    err.message.includes("couldn't load module")
  ) {
    return false; // prevent Cypress from failing the test
  }
});

