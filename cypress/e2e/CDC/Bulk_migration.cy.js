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
    cy.contains('a', 'Migration').click();
    cy.contains('button', 'Create Migration').click();
    cy.screenshot("after-clicking-createcdc-button");
  
    // ------------------------------------- Select Source Connection ---------------------------------------
    cy.xpath("(//input[@placeholder='Select Connection'])[1]").should('be.visible').click();
    cy.get('div').contains(srcConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source connection: ${srcConnectionName}`);
    cy.wait(2000);


    // ------------------------------------- Select Source Schema ---------------------------------------
    cy.xpath("(//input[@placeholder='Select Schema'])[1]").should('be.visible').click();
    cy.get('div').contains(srcSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source connection: ${srcSchemaName}`);
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




    // ------------------------------------- Select Target Connection ---------------------------------------
    cy.xpath("(//input[@placeholder='Select Connection'])[2]").should('be.visible').click();
    cy.get('div').contains(tarConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source connection: ${tarConnectionName}`);
    cy.wait(2000);


    // ------------------------------------- Select Target Schema ---------------------------------------
    cy.xpath("(//input[@placeholder='Select Schema'])[2]").should('be.visible').click();
    cy.get('div').contains(tarSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source connection: ${tarSchemaName}`);
    cy.wait(2000);

     // ------------------------------------------- Select Target tables  --------------------------------------------
    // Loop through and click all target tables
    ttableNames.forEach(table => {
      cy.contains('label', table).should('be.visible').click();
    });

    let migrationName; // declare outside

    // Capture CDC Name and trigger jobs
    cy.xpath('//input[@placeholder="migration Name"]').invoke('val').then((val) => {
    migrationName = val;  // assign to outer variable
    cy.log('Migration Name:', migrationName);

    //---------------------------------------- Click Save in CDC job page  ----------------------------------------
    cy.contains('button', /^save$/i).should('be.visible').click();
    cy.contains('button', /^yes$/i).should('be.visible').click();
    cy.screenshot("after-saved-cdcjob-creation");
    cy.contains('p', 'saved successfully').should('be.visible');
    cy.contains('button', /^alright$/i).should('be.visible').click();
    cy.wait(3000);

    //-------------------------------------------- Click Browser Refresh ------------------------------------------------
cy.reload();
cy.wait(30000);
cy.reload();
cy.wait(5000);



cy.get('table tbody tr')
  .should('have.length.greaterThan', 0)
  .each(($row) => {
    const cells = $row.find('td');
    const nameCell = Cypress.$(cells[0]).text().trim();

    if (nameCell.startsWith(migrationName)) {
      cy.wrap($row).scrollIntoView().within(() => {
        cy.get('button[aria-label="Open actions menu"]')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });

        cy.get('button[aria-label="Run"]')
          .should('be.visible')
          .click({ force: true });
      });
      cy.wait(2000); // stop after first match
    }
  });


});
});
});