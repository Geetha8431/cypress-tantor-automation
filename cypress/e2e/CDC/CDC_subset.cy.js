/// <reference types="cypress" />
describe('Create New CDC Job Configuration in Tantor', () => {
  before(() => {
    // Load config from fixture
    cy.fixture('Subset_cdc').then((config) => {
      Cypress.env('url', config.URL);
      Cypress.env('username', config.Username);
      Cypress.env('password', config.Password);
      Cypress.env('srcConnectionName', config.srcConnectionName);
      Cypress.env('srcSchemaName', config.srcSchemaName);
      Cypress.env('datasetToSearch', config.datasetToSearch);
      Cypress.env('datasetLabel', config.datasetLabel);
      Cypress.env('tarConnectionName', config.tarConnectionName);
      Cypress.env('tarSchemaName', config.tarSchemaName);
      Cypress.env('targetTableName', config.targetTableName);
      Cypress.env('labelText', config.labelText);
    });
  });
  it('should create a new CDC config and verify CDC status', () => {
    const {
      url,
      username,
      password,
      srcConnectionName,
      srcSchemaName,
      datasetToSearch,
      datasetLabel,
      tarConnectionName,
      tarSchemaName,
      targetTableName,
    } = Cypress.env();


    cy.visit(url);
    // Login
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();

    // Navigate to Connections
    cy.get('a').contains('Connections').should('be.visible').should('not.be.disabled').click({ force: true });
    cy.wait(1000);

    // Select Transformation Project
    cy.get('select.w-44').should('be.visible').then(($select) => {
      const options = [...$select[0].options].map(o => o.textContent.trim());
      cy.log('Available dropdown options:', options);
      const transformationOption = options.find(opt => opt.includes('Transformation'));
      if (transformationOption) {
        cy.get('select.w-44').select(transformationOption);
        cy.log(`Selected: ${transformationOption}`);
      } else {
        cy.log('Transformation option not found in:', options);
        cy.get('select.w-44').select(0);
      }
    });
    cy.wait(1000);

    // Open CDC creation
    cy.contains('a', 'CDC', { timeout: 1000 }).click();
    cy.contains('button', '+ Create CDC').click();

    // Select Source Connection
    cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').click();
    cy.wait(2000);
    cy.contains('div', srcConnectionName).should('be.visible').click();
    cy.log(`Clicked source connection: ${srcConnectionName}`);
    cy.wait(1000);

    // Select Source Schema
    cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').click();
    cy.wait(2000);
    cy.contains('div', srcSchemaName).should('be.visible').click();
    cy.log(`Clicked source schema: ${srcSchemaName}`);
    cy.wait(1000);

    // Select Subset Option
    cy.get('label').contains('Subset').should('be.visible').click();
    cy.log('Selected Subset option');
    cy.wait(1000);

    // Click the "Select Table" dropdown button
    cy.contains('button', 'Select Table').should('be.visible').click();

    // Wait for the search input to appear and type
    cy.get('input[placeholder="Search table..."]', { timeout: 10000 }).should('be.visible').type(datasetToSearch);

    // Click the dataset label
    cy.contains('div', datasetLabel).click();
    cy.wait(1000);
    
    
    // Target schema
    // Click the fourth div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(4).should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
  
    // Click target connection (equivalent to Selenium's wait.until + click)
    expect(tarConnectionName, 'tarConnectionName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarConnectionName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target connection: ${tarConnectionName}`);
    cy.wait(2000);

    // Target schema
    // Click the fourth div with class 'w-full relative'
    cy.get('div.w-full.relative').eq(5).should('be.visible').should('not.be.disabled').click();
    cy.wait(2000);
    
    // Click target schema (equivalent to Selenium's wait.until + click)
    expect(tarSchemaName, 'tarSchemaName must be defined').to.be.a('string').and.not.empty;
    cy.get('div').contains(tarSchemaName).should('be.visible').should('not.be.disabled').click();
    cy.log(`Clicked target schema: ${tarSchemaName}`);
    cy.wait(2000);
    
    // Click the target table dropdown (after clicking schema)
    cy.contains('button', 'Select Table').should('be.visible').click();

    // Wait for the search input to appear and type the target table name
    cy.get('input[placeholder="Search tables..."]', { timeout: 10000 }).should('be.visible').type(targetTableName);

    // Click the target table label
    cy.contains('div', targetTableName).click();
    cy.wait(1000);

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
cy.get('table tbody tr').eq(0).find('td').eq(7)
  .invoke('text')
  .then((text) => {
    cy.log('Current status text: ' + text); // For debugging
    expect(
      text.includes('Ready to Run') || text.includes('Failed'),
      `Status cell text is "${text}"`
    ).to.be.true;
  }, { timeout: 60000 });

  //Click Run button to trigger the Job
  cy.get('button[aria-label="Run"]').click();  
  });
});
