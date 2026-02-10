//xpath, 

/// <reference types="cypress" />

describe('Cdc -> Logs and Configuration History', () => {

  it('Logs into Tantor and Perform UI Actions', () => {
    // ✅ Load fixture and run test inside the callback
    cy.fixture('Logs_ConfigHistory').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });

      const { URL, Username, Password, Project, Connector_Type, Log_Level, Time_Range, Start_Date, End_Date, Search_input} = config;


// 🔐 Login
cy.visit(URL);
cy.get('#username').type(Username);
cy.get('#password').type(Password);
cy.get('#remember-me').check();
cy.get('button[type="submit"]').click();
cy.url().should('include', '/dashboard');


//------------------------------ Navigate to Connections --------------------------------
// Click "Connections"
cy.contains('span', 'Connections').should('be.visible').parent('a').click();
cy.wait(2000);
// Select "Transformation"
cy.get('select.w-44').should('be.visible').select(Project);
cy.wait(2000);

//------------------------------------------ CDC Page --------------------------------------------
cy.xpath("//a[@href='/cdc']").should('be.visible').click(); // Go to CDC Job page
cy.wait(2000);
cy.xpath("(//button[@type = 'button'])[1]").should('be.visible').click(); // Click the first 3 lines button
cy.wait(2000);
cy.xpath("//table//tbody/tr[1]/td[9]").should('be.visible').click(); // Click on the 3-dot menu in the first row (9th column)
cy.wait(2000);
cy.xpath("//button[@aria-label='View']").should('be.visible').click(); // Click on the "View" button inside the dropdown or menu
cy.wait(2000);

//------------------------------------ Logs --------------------------------------
cy.xpath("//button[text() = 'Logs']").should('be.visible').click(); cy.wait(500);
cy.screenshot('logs-section');

cy.xpath("//span[text() = 'INFO']").should('be.visible').click(); cy.wait(2000);
cy.xpath("//span[text() = 'WARN']").should('be.visible').click(); cy.wait(2000);
cy.xpath("//span[text() = 'ERROR']").should('be.visible').click(); cy.wait(2000);
//cy.xpath("//button[text() = 'Export']").should('be.visible').click(); //Source Logs Download

cy.xpath("//button[text() = 'Switch to Target']").should('be.visible').click(); cy.wait(2000);
cy.xpath("//span[text() = 'INFO']").should('be.visible').click(); cy.wait(2000);
cy.xpath("//span[text() = 'WARN']").should('be.visible').click(); cy.wait(2000);
cy.xpath("//span[text() = 'ERROR']").should('be.visible').click(); cy.wait(2000);
// cy.xpath("//button[text() = 'Export']").should('be.visible').click(); //Target Logs Download


// ---------------------------------------------- Filters Logs --------------------------------------------
cy.xpath("//button[text() = 'Filters']").should('exist').scrollIntoView().wait(300).click({ force: true });

// ✅ Select values from dropdowns
cy.get('#connector-filter').should('be.visible').select(Connector_Type);
cy.wait(500);
cy.get('#log-level').should('be.visible').select(Log_Level);
cy.wait(500);
cy.get('#time-range').should('be.visible').select(Time_Range);
cy.wait(2000);

// ✅ Only do custom range if time range is "Custom range"
if (Time_Range === 'Custom range') {
  // Start Date
  if (Start_Date) {
    cy.get('input[type="datetime-local"]').eq(0)
      .clear()
      .type(`${Start_Date}T00:00`)
      .should('have.value', `${Start_Date}T00:00`);
  }

  // End Date
  if (End_Date) {
    cy.get('input[type="datetime-local"]').eq(1)
      .clear()
      .type(`${End_Date}T23:59`)
      .should('have.value', `${End_Date}T23:59`);
  }

  // Click Apply
  cy.contains('button', 'Apply Date Range').click();
  cy.wait(3000);
  // Optional: Validate at least one log is shown
  cy.get('table').should('not.contain.text', 'No logs match your filter criteria_');
}

cy.screenshot('before-search');
cy.get('#search-logs').should('be.visible').clear().type(Search_input);
// ✅ Make sure at least one row is shown with searched input
cy.get('table').should('contain.text', Search_input); //cy.get('table').invoke('text').should('match', new RegExp(Search_input, 'i'));
cy.screenshot('after-search');
cy.wait(1000);

//---------------------------------------------- Export Logs ---------------------------------------------
cy.xpath("//button[text() = 'Export']").should('exist').scrollIntoView().wait(300).click({ force: true });
cy.screenshot('searched-logs-download');

//---------------------------------------------- Refresh Logs ---------------------------------------------
cy.xpath("//button[text() = 'Refresh']").should('exist').scrollIntoView().wait(300).click({ force: true });
cy.wait(3000);

cy.xpath("//button[text() = 'Configuration History']").should('be.visible').click();
cy.screenshot('configuration-history-section');

 });
});
});