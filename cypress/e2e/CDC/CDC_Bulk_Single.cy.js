/// <reference types="cypress" />

describe('Create New CDC Job Configuration in Tantor', () => {
  before(() => {
    // Load config from fixture
    cy.fixture('Bulk_S').then((config) => {
      Cypress.env('url', config.URL);
      Cypress.env('username', config.Username);
      Cypress.env('password', config.Password);
       Cypress.env('project', config.Project);
      Cypress.env('srcConnectionName', config.srcConnectionName);
      Cypress.env('srcSchemaName', config.srcSchemaName);
      Cypress.env('SourcetableName', config.SourcetableName);
      Cypress.env('tarConnectionName', config.tarConnectionName);
      Cypress.env('tarSchemaName', config.tarSchemaName);
      Cypress.env('TargetTableName', config.TargetTableName);
      
      
    });
  });

  it('should create a new CDC config and verify metadata status', () => {
    const url = Cypress.env('url');
    const username = Cypress.env('username');
    const password = Cypress.env('password');
    const project = Cypress.env('project');
    const srcConnectionName = Cypress.env('srcConnectionName');
    const srcSchemaName = Cypress.env('srcSchemaName');
    const SourcetableName = Cypress.env('SourcetableName');
    const tarConnectionName = Cypress.env('tarConnectionName');
    const tarSchemaName = Cypress.env('tarSchemaName');
    const TargetTableName = Cypress.env('TargetTableName');

    // --------------------------------- Login to Tantor -----------------------------------
    cy.visit(url);
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();


    //------------------------------ Navigate to Connections --------------------------------
    // Click "Connections"
    cy.contains('span', 'Connections').should('be.visible').parent('a').click();
    cy.wait(2000);
    // Select project 
    cy.get('select.w-44').should('be.visible').select(project);
    cy.wait(2000);


    // --------------------------------------------- CDC Page ----------------------------------------------
    cy.contains('a', 'CDC', { timeout: 1000 }).click();
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

    // ------------------------------------------ Select Bulk in Source -----------------------------------------
    // Select Bulk option
    cy.get('label').contains('Bulk').should('be.visible').click();
    cy.log('Selected Bulk option');
    cy.wait(1000);
    
    // ----------------------------------------- Select Dataset label -------------------------------------------
    // Source dataset search and selection
    cy.get('label').contains('Data Set').should('be.visible').should('not.be.disabled').click();
    cy.log('Clicked Data Set label');
    cy.wait(2000);
    
    // ------------------------------------- Send Source table into search field --------------------------------
    // Type in the search field
    expect(SourcetableName, 'SourcetableName must be defined').to.be.a('string').and.not.empty;
    cy.get('input[placeholder="Search datasets..."]').should('be.visible').type(SourcetableName);
    cy.log(`Typed in search field: ${SourcetableName}`);
    cy.wait(2000);
    // Click on the dataset label
    expect(SourcetableName, 'SourcetableName must be defined').to.be.a('string').and.not.empty;
    cy.get('label').contains(SourcetableName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked dataset label: ${SourcetableName}`);
    cy.wait(1000);
    
    // ----------------------------------------- Select Target connection -----------------------------------------
    // Click the third button in div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
    cy.wait(1000);
    // Click target connection 
    expect(tarConnectionName, 'tarConnectionName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target connection: ${tarConnectionName}`);
    cy.wait(1000);
    
    // ------------------------------------------- Select Target Schema ------------------------------------------
    cy.get('div.w-full.relative').eq(4).should('be.visible').should('not.be.disabled').click();
    cy.wait(1000);
    // Click target schema 
    expect(tarSchemaName, 'tarSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target schema: ${tarSchemaName}`);
    cy.wait(1000);

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

    // Click the desired target table label
    expect(TargetTableName, 'targetTableName must be defined').to.be.a('string').and.not.empty;
    cy.get('div.ml-6.space-y-2 label').contains(TargetTableName)
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    cy.wait(1000);
    cy.log(`Target table '${TargetTableName}' selected.`);

    cy.screenshot("after-srctar-selection");

    // ---------------------------------------------- Select Scope ------------------------------------------------
    // Click Scope button
    cy.contains('span', 'Scope').should('be.visible').should('not.be.disabled').click();
    cy.wait(1000); // Give UI time to render checkboxes

    //---------------------------------------- Deslect Insert check Box --------------------------------------------
    // Click the Insert checkbox span (the span before the Insert label)
cy.contains('span', 'Insert')
.parent()
.find('span')
.first()
.should('be.visible')
.click();
cy.wait(1000);

//---------------------------------------- Select Upsert check Box ---------------------------------------------
// Click the Upsert checkbox span
cy.contains('span', 'Upsert')
.parent()
.find('span')
.first()
.should('be.visible')
.click();
cy.wait(1000);

//---------------------------------------- Select Delete check Box --------------------------------------------
// Click the Delete checkbox span
cy.contains('span', 'Delete')
.parent()
.find('span')
.first()
.should('be.visible')
.click();
cy.wait(1000);

cy,screenshot("after-operation-selection");

//---------------------------------------- Click Save In Scope --------------------------------------------
// Click the Save button
cy.contains('button', 'Save').should('be.visible').should('not.be.disabled').click();

cy.wait(1000);

//---------------------------------------- Click Save CDC job page  ----------------------------------------
// Click the SAVE button (case-insensitive)
cy.contains('button', /^save$/i).should('be.visible').should('not.be.disabled').click();

//---------------------------------------- Click Yes on confirm popup ---------------------------------------
// Click the Yes button safely
cy.contains('button', /^yes$/i).should('be.visible').should('not.be.disabled').click();

// Wait for the success message to be visible
cy.contains('p', 'saved successfully').should('be.visible');
cy.screenshot("after-saved-cdcjob-creation");

//---------------------------------------- Click Alright on confirm popup -----------------------------------
// Click the Alright button
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