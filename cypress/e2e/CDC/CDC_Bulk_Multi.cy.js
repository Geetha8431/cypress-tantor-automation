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
    const stableNames = Cypress.env('stableNames');
    const ttableNames = Cypress.env('ttableNames');
    const tarConnectionName = Cypress.env('tarConnectionName');
    const tarSchemaName = Cypress.env('tarSchemaName');

      cy.visit(url);
  
      // Login
      cy.get('#username').type(username);
      cy.get('#password').type(password);
      cy.get('#remember-me').check();
      cy.get('button[type="submit"]').click();
  
      // Go to Connections
      cy.contains('a', 'Connections').should('be.visible').click({ force: true });
      cy.wait(2000);
  
//------------------------------ Navigate to Connections --------------------------------
// Click "Connections"
cy.contains('span', 'Connections').should('be.visible').parent('a').click();
cy.wait(2000);
// Select "Transformation"
cy.get('select.w-44').should('be.visible').select(project);
cy.wait(2000);
  
      // Start CDC flow
      cy.contains('a', 'CDC').click();
      cy.contains('button', '+ Create CDC').click();
  
      // Select Source Connection and Schema (reusable function)
      cy.selectSourceConnectionAndSchema(Cypress.env('srcConnectionName'), Cypress.env('srcSchemaName'));
      
      // Select Bulk Option
      cy.contains('label', 'Bulk').click();
  
      // Click "Data Set" to open table search
      cy.contains('label', 'Data Set').click();
      cy.wait(500);
  
      // Loop through and select all table names
      stableNames.forEach((tableName) => {
        cy.get('input[placeholder="Search datasets..."]')
          .clear()
          .type(tableName);
        cy.contains('label', tableName).should('be.visible').click();
        cy.wait(500);
      });
  

   // Target connection
    // Click the third button in div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
    cy.wait(1000);
    
    // Click target connection (equivalent to Selenium's wait.until + click)
    expect(tarConnectionName, 'tarConnectionName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target connection: ${tarConnectionName}`);
    cy.wait(1000);
    
    // Target schema
    // Click the fourth div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(4).should('be.visible').should('not.be.disabled').click();
    cy.wait(1000);
    
    // Click target schema (equivalent to Selenium's wait.until + click)
    expect(tarSchemaName, 'tarSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target schema: ${tarSchemaName}`);
    cy.wait(1000);





      // Loop through and click all target tables
      ttableNames.forEach(table => {
        cy.contains('label', table).should('be.visible').click();
      });

    // Click Scope button
    cy.contains('span', 'Scope').should('be.visible').should('not.be.disabled').click();
    cy.wait(1000); // Give UI time to render checkboxes

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

cy.wait(2000);
/// Click the 6th button on the page (index 5)
cy.get('button').eq(5).should('be.visible').should('not.be.disabled').click();

// Wait until the row appears
cy.get('table tbody tr').eq(0).find('td').eq(7).should('exist');

// Wait up to 60 seconds for the status cell to become "Ready to Run" or "Failed"
cy.get('table tbody tr').eq(0).find('td').eq(7)
  .invoke('text')
  .then((text) => {
    cy.log('Current status text: ' + text); // For debugging
    expect(
      text.includes('Ready to Run') || text.includes('Failed'),
      `Status cell text is "${text}"`
    ).to.be.true;
  }, { timeout: 60000 });

cy.get('button[aria-label="Run"]').click();


    });
});


