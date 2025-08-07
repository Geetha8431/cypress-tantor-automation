/// <reference types="cypress" />

describe('Target Connector Edit', () => {

  it('Logs into Tantor and Perform UI Actions', () => {
    // ✅ Load fixture and run test inside the callback
    cy.fixture('TAR_Conn_Edit').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });

      const { URL, Username, Password, Project, invalidConfig, validConfig } = config;

      
// 🔁 Reusable helper to update config fields
  const updateDatabaseConfig = ({ DBURL, user, pass }) => {
    cy.xpath("//label[text()='connection.url']/following-sibling::input").clear().type(DBURL);
    cy.xpath("//label[text()='connection.username']/following-sibling::input").clear().type(user);
    cy.xpath("//label[text()='connection.password']/following-sibling::input").clear().type(pass);
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

//------------------ Edit Config with Invalid Values -----------------
cy.xpath("(//button[contains(., 'Edit')])[2]").should('be.visible').click(); // Click Source Edit
cy.wait(2000);
cy.xpath("//button[contains(text(), ' Edit')]").should('be.visible').click(); // Again Click Edit button
cy.wait(2000);

// Edit Config with Invalid Values
updateDatabaseConfig(invalidConfig);

cy.xpath("//button[contains(., 'Save Changes')]").should('be.visible').click(); cy.wait(500);
cy.screenshot('tar-connector-after-save-1');
cy.xpath("//button[contains(., 'Cancel')]").should('be.visible').click(); //Cancel
cy.reload(); //Browser Refresh
cy.wait(500);

// Target change to Yellow color
cy.screenshot('tar-connector-failed-task');

// View Source Configuration after ivalid entries
cy.xpath("(//button[contains(., 'View full configuration')])[2]").should('be.visible').click(); cy.wait(500);
cy.screenshot('tar-connector-view-full-configuration-1');
cy.xpath("//button[text() = 'Close']").should('be.visible').click();


//------------------ Edit Config with Invalid Values -----------------
cy.xpath("(//button[contains(., 'Edit')])[2]").should('be.visible').click();
cy.xpath("//button[contains(text(), ' Edit')]").should('be.visible').click();

updateDatabaseConfig(validConfig);

cy.xpath("//button[contains(., 'Save Changes')]").should('be.visible').click(); cy.wait(500);
cy.screenshot('tar-connector-after-save-2');
cy.xpath("//button[contains(., 'Cancel')]").should('be.visible').click();  cy.wait(2000);
cy.reload(); //Browser Refresh

cy.wait(2000);

cy.xpath("(//button[contains(., 'View full configuration')])[2]").should('be.visible').click(); cy.wait(500);
cy.screenshot('tar-connector-view-full-configuration-2');
cy.xpath("//button[text() = 'Close']").should('be.visible').click();



});
});
});