/// <reference types="cypress" />
describe('CDC Page Validation - Tantor', () => {
  before(() => {
    // Load config from fixture into Cypress.env
    cy.fixture('Cdc_Dashboard').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });
    });
  });

  
  it('Navigates to CDC page and validates dropdowns and job tables', () => {
    const url = Cypress.env('URL');
    const username = Cypress.env('Username');
    const password = Cypress.env('Password');
    const threeLinesButtonIndex = Cypress.env('threeLinesButtonIndex');
    const threeLinesRefreshIndex = Cypress.env('threeLinesRefreshIndex') || 6; // Default to 6 if not set
    const refreshButtonIndex = Cypress.env('refreshButtonIndex');
    const dropdownOptions = Cypress.env('dropdownOptions');
    const expectedDetailsCount = Cypress.env('expectedDetailsCount');
    // Go to the application directly (assume no SSL warning)
    cy.visit(url);
    // Login
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();
    //Zoom out
    cy.document().then(doc => {
      doc.body.style.zoom = '80%';
    });
    // Go to CDC page
    cy.get('a[href="/cdc"]', { timeout: 10000 }).should('be.visible').click();
    cy.screenshot('CDC_Dashboard_Page');

    // Click 3-lines button
    cy.get('button').eq(threeLinesButtonIndex).click();
    cy.log('Clicked 3-lines button');
    cy.screenshot('After_clicking_3lines_button');
    
    // Wait for menu to open
    cy.wait(2000);

    // Click refresh button from 3-lines menu using index
    cy.get('button').eq(5).click();
    // Wait for refresh to complete without checking for 'refreshed' text
    cy.wait(1000);
    cy.screenshot('After_clicking_refresh_in_3lines');

    cy.wait(2000);

    // Search for "oracle" using CSS selector
    cy.get('input[placeholder="Search..."]').should('be.visible').type('oracle', { force: true });
    cy.wait(1000);
    cy.screenshot('After_search_for_oracle_3lines_menu');
    // Go back to previous page
    cy.go('back');
    
    // Click refresh button from CDC Dashboard
    cy.get('button').eq(refreshButtonIndex).click();
    // Wait for refresh to complete without checking for 'refreshed' text
    cy.wait(1000);
    cy.screenshot('After_clicking_Refresh_button_in_CDC_Dashboard');


    // Validate dropdown values (Weekly, Monthly, Yearly)
    cy.get('select.rounded-md').then(($select) => {
      const options = [...$select[0].options].map(o => o.textContent.trim());
      options.forEach(option => {
        cy.get('select.rounded-md').select(option);
        cy.log(`Selected: ${option}`);
        cy.get('select.rounded-md').find(':selected').should('have.text', option);
        cy.screenshot(`Selected_${option}`);
        cy.wait(1000);
      });
    });

    /// DB list and job validation
    cy.get('button').filter(':contains("See details")').should('have.length', 5).as('detailButtons');
    
    // Click each button and verify navigation
    for (let i = 0; i < 5; i++) {
      // Get the buttons again after each navigation
      cy.get('button').filter(':contains("See details")').eq(i).click();
      // Wait for navigation to complete
      cy.wait(200);
      // Verify we're on a details page
      cy.url().should('not.include', '/cdc');
      cy.screenshot(`Details_Page_${i + 1}`);
      cy.wait(200);
      cy.go('back');
      // Wait for return navigation
      cy.wait(200);
      // Verify we're back on CDC page
      cy.url().should('include', '/cdc');
      // Wait for the page to be fully loaded
      cy.wait(200);
      
    }
  });
});
