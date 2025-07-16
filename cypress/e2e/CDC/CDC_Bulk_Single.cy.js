/// <reference types="cypress" />

describe('Create New CDC Job Configuration in Tantor', () => {
  before(() => {
    // Load config from fixture
    cy.fixture('Bulk_S').then((config) => {
      Cypress.env('url', config.URL);
      Cypress.env('username', config.Username);
      Cypress.env('password', config.Password);
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
    const srcConnectionName = Cypress.env('srcConnectionName');
    const srcSchemaName = Cypress.env('srcSchemaName');
    const SourcetableName = Cypress.env('SourcetableName');
    const tarConnectionName = Cypress.env('tarConnectionName');
    const tarSchemaName = Cypress.env('tarSchemaName');
    const TargetTableName = Cypress.env('TargetTableName');

    // Go to the application directly (assume no SSL warning)
    cy.visit(url);

    // Login
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();

    // Click on Connections link (equivalent to Selenium's wait.until + click)
    cy.get('a').contains('Connections').should('be.visible').should('not.be.disabled').click({force: true});
    cy.wait(2000);

    // Locate the project dropdown and store all options
    cy.get('select.w-44').should('be.visible').then(($select) => {
      // Store all available options
      const options = [...$select[0].options].map(o => o.textContent.trim());
      cy.log('Available dropdown options:', options);
      
      // Find the Transformation option
      const transformationOption = options.find(opt => opt.includes('Transformation'));
      
      if (transformationOption) {
        // Select the Transformation option
        cy.get('select.w-44').select(transformationOption);
        cy.log(`Selected: ${transformationOption}`);
      } else {
        cy.log('Transformation option not found in:', options);
        // Fallback: select first option
        cy.get('select.w-44').select(0);
      }
    });
    cy.wait(1000);

    // Click CDC
    cy.contains('a', 'CDC', { timeout: 1000 }).click();
    cy.contains('button', '+ Create CDC').click();
    
    // Click the first button in div with class 'w-full relative' (equivalent to Selenium's wait.until + click)
    cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
    
    // Click source connection (equivalent to Selenium's wait.until + click)
  
    expect(srcConnectionName, 'srcConnectionName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(srcConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source connection: ${srcConnectionName}`);
    cy.wait(2000);
    
    // Click the second button in div with class 'w-full relative' (equivalent to Selenium's wait.until + click)
    cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
    
    // Click source schema (equivalent to Selenium's wait.until + click)
 
    expect(srcSchemaName, 'srcSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(srcSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked source schema: ${srcSchemaName}`);
    cy.wait(2000);
    
    // Select Bulk option
    cy.get('label').contains('Bulk').should('be.visible').click();
    cy.log('Selected Bulk option');
    cy.wait(1000);
    

    // Source dataset search and selection
    cy.get('label').contains('Data Set').should('be.visible').should('not.be.disabled').click();
    cy.log('Clicked Data Set label');
    cy.wait(2000);
    
    // Type in the search field (equivalent to Selenium's wait.until + sendKeys)
    
    expect(SourcetableName, 'SourcetableName must be defined').to.be.a('string').and.not.empty;
    cy.get('input[placeholder="Search datasets..."]').should('be.visible').type(SourcetableName);
    cy.log(`Typed in search field: ${SourcetableName}`);
    cy.wait(2000);
    
    // Click on the dataset label (equivalent to Selenium's wait.until + click)
    expect(SourcetableName, 'SourcetableName must be defined').to.be.a('string').and.not.empty;
    cy.get('label').contains(SourcetableName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked dataset label: ${SourcetableName}`);
    cy.wait(2000);
    
    // Target connection
    // Click the third button in div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
    cy.wait(2000);
    
    // Click target connection (equivalent to Selenium's wait.until + click)
   
    expect(tarConnectionName, 'tarConnectionName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target connection: ${tarConnectionName}`);
    cy.wait(2000);
    
    // Target schema
    // Click the fourth div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(4).should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
    
    // Click target schema (equivalent to Selenium's wait.until + click)
  
    expect(tarSchemaName, 'tarSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target schema: ${tarSchemaName}`);
    cy.wait(2000);
    
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
    cy.log(`Target table '${TargetTableName}' selected.`);

    // Click Scope button
    cy.contains('span', 'Scope').should('be.visible').should('not.be.disabled').click();
    cy.wait(1000); // Give UI time to render checkboxes

    // Click the Insert checkbox span (the span before the Insert label)
cy.contains('span', 'Insert')
.parent()
.find('span')
.first()
.should('be.visible')
.click();
cy.wait(1000);

// Click the Upsert checkbox span
cy.contains('span', 'Upsert')
.parent()
.find('span')
.first()
.should('be.visible')
.click();
cy.wait(1000);

// Click the Delete checkbox span
cy.contains('span', 'Delete')
.parent()
.find('span')
.first()
.should('be.visible')
.click();
cy.wait(1000);

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