/// <reference types="cypress" />

describe('Adhoc Snapshot', () => {

  // 🔁 Polling Function: Wait for record to appear in target table
       // ✅ Polling: Wait for Expected Value in Target Table
      function waitForTargetRecordCell(expectedValue, maxAttempts = 12, interval = 5000) {
        let attempts = 0;

        const tryFetch = () => {
          cy.log(`🔁 Checking for target record (Attempt ${attempts + 1})`);

          cy.window().then((win) => {
            const editor = win.ace.edit('editor');
            editor.setValue(`SELECT * FROM ${Cypress.env('tarConnectionName')}.${Cypress.env('tarSchemaName')}.${Cypress.env('tarTableName')}`);
            editor.navigateFileEnd();
          });

          cy.xpath("//div[@class='flex justify-between items-center']").click();

          cy.get("table")
            .should('be.visible')
            .then(($table) => {
              if ($table.text().includes(expectedValue)) {
                cy.log("✅ Record found in target table.");
              } else if (++attempts < maxAttempts) {
                cy.wait(interval);
                tryFetch();
              } else {
                throw new Error("❌ Record not found in target table.");
              }
            });
        };

        tryFetch();
      }

  it('Logs into Tantor and Perform UI Actions', () => {
    // ✅ Load fixture and run test inside the callback
    cy.fixture('Adhoc_snapshot').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });

      const {
        URL, Username, Password, Project,
        srcConnectionName, srcSchemaName, srcTableName,
        tarTableName, tarConnectionName, tarSchemaName,
        InsertRecord, insertedrecordid
      } = config;

      //---------------------------------- Run Query Script ----------------------------------------
      const runQuery = (query) => {
        cy.window().then((win) => {
          const editor = win.ace.edit('editor');
          editor.setValue(query);
          editor.navigateFileEnd();
        });
        cy.xpath("//div[@class='flex justify-between items-center']").click(); // Run button
        cy.xpath("//div[@class = 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full']").should('be.visible');
        cy.wait(1000); // Optional buffer
      };

      //--------------------------------- Login to Tantor -------------------------------------------
      cy.visit(URL);
      cy.get('#username').type(Username);
      cy.get('#password').type(Password);
      cy.get('#remember-me').check();
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');

      //------------------------------ Navigate to Connections ---------------------------------------
      cy.contains('span', 'Connections').should('be.visible').parent('a').click();
      cy.wait(2000);
      cy.get('select.w-44').should('be.visible').select(Project);
      cy.screenshot('project-selection');

      // -------------------------- Navigate to Federation > Editor -----------------------------------
      cy.xpath("//a[contains(@href, '/federation')]").click();
      cy.wait(2000);
      cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();

      // ------------------------------- SELECT SRC Execution ------------------------------------------
      runQuery(`SELECT * FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName}`);
      cy.screenshot('select-src-before-insert');

      // --------------------------------------- INSERT Execution ---------------------------------------
      runQuery(`INSERT INTO ${srcConnectionName}.${srcSchemaName}.${srcTableName} ${InsertRecord}`);
      cy.screenshot('insert-into-src');

      
      // 👉 Wait for target record to appear (Update value below)
      const expectedValue = insertedrecordid; // Replace this with a value you inserted
      waitForTargetRecordCell(expectedValue, 12, 5000);

      cy.screenshot('select-tar-after-insert');

    });
  });
});
