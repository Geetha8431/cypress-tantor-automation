/// <reference types="cypress" />

describe('Create New CDC pipeline using Bulk option for Single Tables', () => {
  let userData;

  before(() => {
    cy.fixture("CDC/Bulk_S.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    cy.loginAs(userData.Role);

    cy.xpath("//a[@href='/connections']").click();
    cy.get('select.w-44').should('be.visible').select(userData.Project);

    cy.xpath("//a[@href='/cdc']").should('be.visible').click();
    cy.url().should("include", "/cdc");
  });


  it('should create a new CDC config and verify metadata status', () => {
    cy.contains('a', 'CDC', { timeout: 1000 }).click();
    cy.contains('button', '+ Create CDC').click();
    //cy.screenshot("after-clicking-createcdc-button");

    // ============================ Select the Define CDC node container using its title ============================
    cy.contains('h3', 'Define CDC').should('be.visible').parents('div.bg-white.rounded-lg').as('defineCDCNode');

    // Verify Name label + input
    cy.get('@defineCDCNode').contains('label', 'Name').should('be.visible');
    cy.get('@defineCDCNode').find('input[placeholder="cdc Name"]').should('be.visible');

    // Verify Description label + textarea
    cy.get('@defineCDCNode').contains('label', 'Description').should('be.visible');
    cy.get('@defineCDCNode').find('textarea[placeholder="Enter description..."]').should('be.visible');



    // =========================================== Select Source Connection ====================================
    cy.contains('h3', 'Source').should('be.visible');
    cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').click();
    //cy.contains('div, button, label', userData.srcConnectionName).should('be.visible').click();
    // Select from the dropdown panel (auto-retries until visible)
    cy.get('.absolute:visible, .z-50:visible').contains(userData.srcConnectionName).should('be.visible').click();
    cy.log(`Clicked source connection: ${userData.srcConnectionName}`);


    // ------------------------------------------- Select Source Schema ----------------------------------------
    cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').click();
    //cy.get('.absolute:visible, .z-50:visible').contains('div, button, label', userData.srcSchemaName).should('be.visible').click();
    // Scoped selection — Cypress automatically waits for the dropdown to render
    cy.get('.absolute:visible, .z-50:visible').contains(userData.srcSchemaName).should('be.visible').click();
    cy.log(`Clicked source schema: ${userData.srcSchemaName}`);


    // ------------------------------------------ Select Bulk in Source -----------------------------------------
    cy.contains('label', 'Subset').should('be.visible');
    cy.contains('label', 'Bulk').should('be.visible').click();
    cy.log('Selected Bulk option');

    // ----------------------------------------- Select Dataset label -------------------------------------------
    // Source dataset search and selection
    cy.contains('label', 'Data Set').should('be.visible').click();
    cy.log('Clicked Data Set label');

    // ------------------------------------- Enter Source Table search value --------------------------------
    // Type in the search field
    cy.get('input[placeholder="Search datasets..."]').should('be.visible').type(userData.SourcetableName);
    cy.log(`Typed in search field: ${userData.SourcetableName}`);

    // ------------------------------------- Select Source Table from results --------------------------------
    cy.contains('label', userData.SourcetableName).should('be.visible').click();
    cy.log(`Clicked dataset label: ${userData.SourcetableName}`);



    // =========================================== Select Target Connection ====================================
    cy.contains('h3', 'Target').should('be.visible');
    cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
    // pick connection from visible dropdown
    cy.get('.absolute:visible, .z-50:visible').contains(userData.tarConnectionName).should('be.visible').click();
    cy.log(`Clicked target connection: ${userData.tarConnectionName}`);

    // ------------------------------------------- Select Target Schema ------------------------------------------
    cy.get('div.w-full.relative').eq(4).find("button").should("be.visible").click();
    // pick schema from visible dropdown
    cy.get('.absolute:visible, .z-50:visible').contains(userData.tarSchemaName).should('be.visible').click();
    cy.log(`Clicked target schema: ${userData.tarSchemaName}`);

    // ------------------------------------------- Select Target table  ------------------------------------------
    // Wait for target table options to be visible and list them
    cy.get('div.ml-6.space-y-2 label').should('be.visible').then(($labels) => {
      const tableLabels = [...$labels].map(label => label.textContent.trim());
      cy.log('Available Target Table Options:', tableLabels);
      tableLabels.forEach(label => {
        // eslint-disable-next-line no-console
        console.log('- ' + label);
      });
    });

    // Click the desired target table
    cy.contains('div.ml-6.space-y-2 label', userData.TargetTableName).should('be.visible').click();
    cy.log(`Target table '${userData.TargetTableName}' selected.`);
    //cy.screenshot("after-srctar-selection");

    // =============================================== Select Scope ===============================================
    // Click Scope button
    cy.contains('span', 'Scope').should('be.visible').click();
    cy.contains('h2', 'Scope').should('be.visible');

    //---------------------------------------- Deslect Insert check Box --------------------------------------------
    // Click the Insert checkbox span (the span before the Insert label)
    cy.contains('span', 'Insert')
      .should('be.visible')
      .prev('span')        // checkbox icon just before text
      .click();

    //---------------------------------------- Select Upsert check Box ---------------------------------------------
    // Click the Upsert checkbox span
    cy.contains('span', 'Upsert')
      .should('be.visible')
      .prev('span')        // checkbox icon just before text
      .click();

    //---------------------------------------- Select Delete check Box --------------------------------------------
    // Click the Delete checkbox span
    cy.contains('span', 'Delete')
      .should('be.visible')
      .prev('span')        // checkbox icon just before text
      .click();
    //cy.screenshot("after-operation-selection");

    //---------------------------------------- Click Save In Scope --------------------------------------------
    cy.contains('button', 'Save').should('be.visible').should('not.be.disabled').click();

    //---------------------------------------- Click Save CDC job page  ----------------------------------------
    cy.contains('button', /^save$/i).filter(':visible').should('be.visible').should('not.be.disabled').click();

    //---------------------------------------- Click Yes on cofirm popup ---------------------------------------
    // Click the Yes button safely
    cy.contains('button', /^yes$/i).should('be.visible').should('not.be.disabled').click();

    // Wait for the success message to be visible
    cy.contains('p', 'saved successfully').should('be.visible');
    //cy.screenshot("after-saved-cdcjob-creation");

    //---------------------------------------- Click Alright on confirm popup -----------------------------------
    // Click the Alright button
    cy.contains('button', /^alright$/i).should('be.visible').should('not.be.disabled').click();

    //-------------------------------------------- Click Refresh ------------------------------------------------
    cy.get('button:has(.lucide-refresh-ccw)').scrollIntoView().should('be.visible').click();
    //cy.screenshot("after-refreshed-cdcjob-page");

    cy.get('table tbody tr').eq(0).find('td').eq(7).then(($cell) => {
      const status = $cell.text().trim();

      if (status.includes("Ready to Run")) {
        cy.log("🟢 Status is Ready to Run — triggering job");

        cy.xpath("(//button[@aria-label='Open actions menu'])[1]").click();
        cy.xpath('//button[@aria-label="Run"]').click();
      }

      else if (status.includes("Failed")) {
        cy.log("🔴 CDC Job FAILED — stopping execution");

        // ❗ FAIL THE TEST SO HEADLESS REPORT CLEARLY SHOWS FAILURE
        throw new Error("❌ CDC Job status is FAILED — Cannot trigger job");
      }
    });

  });
});