/// <reference types="cypress" />

describe('Create New CDC Job Configuration in Tantor', () => {
    before(() => {
      cy.fixture('Bulk_M').then((config) => {
        Cypress.env('url', config.URL);
        Cypress.env('username', config.Username);
        Cypress.env('password', config.Password);
        Cypress.env('project', config.Project);
        Cypress.env('srcConnectionName', config.srcConnectionName);
        Cypress.env('srcSchemaName', config.srcSchemaName);
        Cypress.env('stableNames', config.SourcetableNames.split(',').map(name => name.trim()));
        Cypress.env('ttableNames', config.TargetTableNames.split(',').map(name => name.trim()));
        Cypress.env('tarConnectionName', config.tarConnectionName);
        Cypress.env('tarSchemaName', config.tarSchemaName);

      });
    });
  
    it('should create a new CDC config and select multiple tables in Bulk', () => {
    const url = Cypress.env('url');
    const username = Cypress.env('username');
    const password = Cypress.env('password');
    const project = Cypress.env('project');
    const srcConnectionName = Cypress.env('srcConnectionName');
    const srcSchemaName = Cypress.env('srcSchemaName');
    const stableNames = Cypress.env('stableNames');
    const ttableNames = Cypress.env('ttableNames');
    const tarConnectionName = Cypress.env('tarConnectionName');
    const tarSchemaName = Cypress.env('tarSchemaName');

 

    // ----------------------------------------- Login to Tantor ------------------------------------------
    cy.visit(url);
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();
  

    //---------------------------------------- Navigate to Connections -------------------------------------
    // Click "Connections"
    cy.contains('span', 'Connections').should('be.visible').parent('a').click();
    cy.wait(2000);
    // Select "Transformation"
    cy.get('select.w-44').should('be.visible').select(project);
    cy.wait(2000);
  
    // ---------------------------------------------- CDC Page ----------------------------------------------
    cy.contains('a', 'CDC').click();
    cy.contains('button', '+ Create CDC').click();
    cy.screenshot("after-clicking-createcdc-button");
  
    // ------------------------------------- Select Source Connection ---------------------------------------
    // This likely opens a dropdown or expands a list of connections in your app.
    cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
    // A runtime assertion to make sure srcConnectionName is: A string. Not empty.
    expect(srcConnectionName, 'srcConnectionName must be defined').to.be.a('string').and.not.empty;
    // This is where the script clicks on the source connection in the UI — like selecting a DB from a list.
    cy.get('div').contains(srcConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source connection: ${srcConnectionName}`);
    cy.wait(2000);
    

    // ------------------------------------------- Select Source Schema ----------------------------------------
    // Click the second button in div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
    // Click source schema 
    expect(srcSchemaName, 'srcSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(srcSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source schema: ${srcSchemaName}`);
    cy.wait(2000);

    // ------------------------------------------ Select Bulk in Source ----------------------------------------
    // Select Bulk Option
    cy.contains('label', 'Bulk').click();

    // ------------------------ Send Source tables into search field and select them ----------------------------
    // Click "Data Set" to open table search
    cy.contains('label', 'Data Set').click();
    cy.wait(500);
  
    // Loop through and select all table names
    stableNames.forEach((tableName) => {
      cy.get('input[placeholder="Search datasets..."]').clear().type(tableName);
      cy.contains('label', tableName).should('be.visible').click();
      cy.wait(500);
      });
  
    // ----------------------------------------- Select Target connection -----------------------------------------
    // Click the third button in div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
    cy.wait(1000);
    // Click target connection
    expect(tarConnectionName, 'tarConnectionName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target connection: ${tarConnectionName}`);
    cy.wait(1000);
    
    // ------------------------------------------- Select Target Schema --------------------------------------------
    // Click the fourth div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(4).should('be.visible').should('not.be.disabled').click();
    cy.wait(1000);
    // Click target schema 
    expect(tarSchemaName, 'tarSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target schema: ${tarSchemaName}`);
    cy.wait(1000);

    // ------------------------------------------- Select Target tables  --------------------------------------------
    // Loop through and click all target tables
    ttableNames.forEach(table => {
      cy.contains('label', table).should('be.visible').click();
    });

    // ---------------------------------------------- Select Scope --------------------------------------------------
    // Click Scope button
    cy.contains('span', 'Scope').should('be.visible').should('not.be.disabled').click();
    cy.wait(1000); // Give UI time to render checkboxes

    //-------------------------------- Loop throgh all tables and select operations ---------------------------------
  stableNames.forEach((table) => {
        // Select table from dropdown
        cy.get('select').select(table);
        cy.wait(1000); // Let checkboxes update

        // --------- INSERT ----------
        cy.contains('span', 'Insert')
          .prev('span')
          .then(($insert) => {
            if ($insert.hasClass('Mui-checked')) {
              cy.wrap($insert).click();
              cy.log(`Deselected Insert for ${table}`);
            }
          });

        // --------- UPSERT ----------
        cy.contains('span', 'Upsert')
          .prev('span')
          .then(($upsert) => {
            if (
              !$upsert.hasClass('Mui-disabled') &&
              !$upsert.hasClass('Mui-checked')
            ) {
              cy.wrap($upsert).click();
              cy.log(`Selected Upsert for ${table}`);
            } else {
              cy.log(`Skipped Upsert for ${table}`);
            }
          });

        // --------- DELETE ----------
        cy.contains('span', 'Delete')
          .prev('span')
          .then(($delete) => {
            if (
              !$delete.hasClass('Mui-disabled') &&
              !$delete.hasClass('Mui-checked')
            ) {
              cy.wrap($delete).click();
              cy.log(`Selected Delete for ${table}`);
            } else {
              cy.log(`Skipped Delete for ${table}`);
            }
          });
      });

cy,screenshot("after-operation-selection");

//---------------------------------------- Click Save In Scope --------------------------------------------
// Click the Save button
cy.contains('button', 'Save').should('be.visible').should('not.be.disabled').click();
cy.wait(1000);
cy.contains('button', /^save$/i).should('be.visible').should('not.be.disabled').click();
cy.contains('button', /^yes$/i).should('be.visible').should('not.be.disabled').click();
cy.contains('p', 'saved successfully').should('be.visible');
cy.screenshot("after-saved-cdcjob-creation");
cy.contains('button', /^alright$/i).should('be.visible').should('not.be.disabled').click();
cy.wait(3000);

//-------------------------------------------- Click Refresh ------------------------------------------------
cy.get('button').eq(5).should('be.visible').should('not.be.disabled').click();
cy.screenshot("after-refreshed-cdcjob-page");

// -------------------------------------- Click 3 dots on 1st job -------------------------------------------
cy.xpath("(//button[@aria-label='Open actions menu'])[1]").should("be.visible").click();

// ---------------------------------------- Click Trigger button --------------------------------------------
cy.xpath('//button[@aria-label="Run"]').click();
cy.screenshot("after-triggered-cdc-job");


});
});