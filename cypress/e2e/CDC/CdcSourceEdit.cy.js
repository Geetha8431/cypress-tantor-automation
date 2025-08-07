/// <reference types="cypress" />

describe('Source Connector Edit', () => {

  it('Logs into Tantor and Perform UI Actions', () => {
    // ✅ Load fixture and run test inside the callback
    cy.fixture('SRC_Conn_Edit').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });

      const { URL, Username, Password, Project, invalidConfig, validConfig } = config;


// 🔁 Reusable helper to update config fields
  const updateDatabaseConfig = ({ host, port, user, pass, dbname }) => {
    cy.xpath("//label[text()='database.hostname']/following-sibling::input").clear().type(host);
    cy.xpath("//label[text()='database.port']/following-sibling::input").clear().type(port);
    cy.xpath("//label[text()='database.user']/following-sibling::input").clear().type(user);
    cy.xpath("//label[text()='database.password']/following-sibling::input").clear().type(pass);
    cy.xpath("//label[text()='database.dbname']/following-sibling::input").clear().type(dbname);
    cy.wait(2000)
  };


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


//---------------------------------------- CDC Page --------------------------------------
cy.xpath("//a[@href='/cdc']").should('be.visible').click(); // Go to CDC Job page
cy.wait(2000);
cy.xpath("(//button[@type = 'button'])[1]").should('be.visible').click(); // Click the first 3 lines button
cy.wait(2000);
cy.xpath("//table//tbody/tr[1]/td[9]").should('be.visible').click(); // Click on the 3-dot menu in the first row (9th column)
cy.wait(2000);
cy.xpath("//button[@aria-label='View']").should('be.visible').click(); // Click on the "View" button inside the dropdown or menu
cy.wait(2000);


//------------ Edit Source Connector with Valid Config ---------------------
cy.xpath("(//button[contains(., 'Edit')])[1]").should('be.visible').click(); // Click Source Edit
cy.wait(2000);
cy.xpath("//button[contains(text(), ' Edit')]").should('be.visible').click(); // Again Click Edit button
cy.wait(2000);

updateDatabaseConfig(validConfig);

cy.xpath("//button[contains(., 'Save Changes')]").should('be.visible').click(); cy.wait(5000);
cy.screenshot('src-connector-after-save');
cy.xpath("//button[contains(., 'Cancel')]").should('be.visible').click(); 
cy.reload(); //Refresh

cy.wait(2000);

// View Source Configuration 
cy.xpath("(//button[contains(., 'View full configuration')])[2]").should('be.visible').click(); cy.wait(2000);
cy.screenshot('src-connector-view-full-configuration');
cy.xpath("//button[text() = 'Close']").should('be.visible').click();



});
});
});