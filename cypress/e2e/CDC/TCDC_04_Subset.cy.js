/// <reference types="cypress" />

describe('Create New CDC pipeline using Subset option', () => {
  let userData;

  before(() => {
    cy.fixture("CDC/Subset_S.json").then((data) => {
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



  it('should create a new CDC config and verify CDC status', () => {

    // Open CDC creation
    cy.contains('a', 'CDC', { timeout: 1000 }).click();
    cy.contains('button', '+ Create CDC').click();

    // =========================================== Select Source Connection ====================================
    cy.contains('h3', 'Source').should('be.visible');
    cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').click();
    cy.get('.absolute:visible, .z-50:visible').contains(userData.SrcConnectionName).should('be.visible').click();
    cy.log(`Clicked source connection: ${userData.SrcConnectionName}`);

    // ------------------------------------------- Select Source Schema ----------------------------------------
    cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').click();
    cy.get('.absolute:visible, .z-50:visible').contains(userData.SrcSchemaName).should('be.visible').click();
    cy.log(`Clicked source schema: ${userData.SrcSchemaName}`);

    // ------------------------------------------ Select Bulk in Source -----------------------------------------
    cy.contains('label', 'Bulk').should('be.visible');
    cy.contains('label', 'Subset').should('be.visible').click();;
    cy.log('Selected Subset option');

    // Click the "Select Table" dropdown button
    cy.contains('button', 'Select Table').should('be.visible').click();

    // Wait for the search input to appear and type
    cy.get('input[placeholder="Search table..."]', { timeout: 10000 }).should('be.visible').type(userData.SourcetableName);

    // Click the dataset label
    cy.contains('div', userData.SourcetableName).click();
    cy.log(`Clicked source Table: ${userData.SourcetableName}`);

    // =========================================== Select Target Connection ====================================
    cy.contains('h3', 'Target').should('be.visible');
    cy.get('div.w-full.relative').eq(4).find('button').should('be.visible').click();
    // pick connection from visible dropdown
    cy.get('.absolute:visible, .z-50:visible').contains(userData.TarConnectionName).should('be.visible').click();
    cy.log(`Clicked target connection: ${userData.TarConnectionName}`);

    // ------------------------------------------- Select Target Schema ------------------------------------------
    cy.get('div.w-full.relative').eq(5).find("button").should("be.visible").click();
    // pick schema from visible dropdown
    cy.get('.absolute:visible, .z-50:visible').contains(userData.TarSchemaName).should('be.visible').click();
    cy.log(`Clicked target schema: ${userData.TarSchemaName}`);


    // --------------------------------- Select the target table dropdown ----------------------------------------
    cy.contains('button', 'Select Table').should('be.visible').click();

    // Wait for the search input to appear and type the target table name
    cy.get('input[placeholder="Search tables..."]', { timeout: 10000 }).should('be.visible').type(userData.TargetTableName);

    // Click the target table label
    cy.contains('div', userData.TargetTableName).should('be.visible').click();

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


    // Click the Save button
    cy.contains('button', 'Save').should('be.visible').should('not.be.disabled').click();

    // Click the SAVE button (case-insensitive)
    cy.contains('button', /^save$/i).should('be.visible').should('not.be.disabled').click();
    // Click the Yes button safely
    cy.contains('button', /^yes$/i).should('be.visible').should('not.be.disabled').click();
    // Wait for the success message to be visible
    cy.contains('p', 'saved successfully').should('be.visible');

    // Click the Alright button
    cy.contains('button', /^alright$/i).should('be.visible').should('not.be.disabled').click();

    /// Click the 6th button on the page (index 5)
    cy.get('button:has(.lucide-refresh-ccw)').scrollIntoView().should('be.visible').click();


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
