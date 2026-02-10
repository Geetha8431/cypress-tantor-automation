/// <reference types="cypress" />

describe('Source Connector Edit', () => {
   let userData;

  before(() => {
    cy.fixture("CDC/SRC_Connector_Edit.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    cy.loginAs(userData.Role);
  });



  it('Logs into Tantor and Perform UI Actions', () => {
    // 🔁 Reusable helper to update config fields
    const updateDatabaseConfig = ({ host, port, user, pass, dbname }) => {
      cy.xpath("//label[text()='database.hostname']/following-sibling::input").should('be.visible').clear().type(host);
      cy.xpath("//label[text()='database.port']/following-sibling::input").should('be.visible').clear().type(port);
      cy.xpath("//label[text()='database.user']/following-sibling::input").should('be.visible').clear().type(user);
      cy.xpath("//label[text()='database.password']/following-sibling::input").should('be.visible').clear().type(pass);
      cy.xpath("//label[text()='database.dbname']/following-sibling::input").should('be.visible').clear().type(dbname);
    };

    //------------------------------ Navigate to Connections --------------------------------
    // Click "Connections"
    cy.contains('span', 'Connections', {timeout: 20000}).should('be.visible').parent('a').click();
    // Select "Transformation"
    cy.get('select.w-44').should('be.visible').select(userData.Project);

    //---------------------------------------- CDC Page --------------------------------------
    cy.xpath("//a[@href='/cdc']").should('be.visible').click(); // Go to CDC Job page
    cy.xpath("(//button[@type = 'button'])[1]").should('be.visible').click(); // Click the first 3 lines button
    cy.wait(2000);
    cy.xpath("//table//tbody/tr[1]/td[9]", { timeout: 20000 }).should('exist').should('be.visible').click(); // Click on the 3-dot menu in the first row (9th column)
    cy.xpath("//button[@aria-label='View']", { timeout: 20000 }).should('exist').should('be.visible').click(); // Click on the "View" button inside the dropdown or menu


    //------------ Edit Source Connector with Valid Config ---------------------
    cy.xpath("(//button[contains(., 'Edit')])[1]").should('be.visible').click(); // Click Source Edit
    cy.xpath("//button[contains(text(), ' Edit')]").should('be.visible').click(); // Again Click Edit button

    updateDatabaseConfig(userData.validConfig);

    cy.xpath("//button[contains(., 'Save Changes')]").should('be.visible').click(); cy.wait(5000);
    //cy.screenshot('src-connector-after-save');
    cy.xpath("//button[contains(., 'Cancel')]").should('be.visible').click();
    cy.reload(); //Refresh

    cy.wait(2000);

    // View Source Configuration 
    cy.xpath("(//button[contains(., 'View full configuration')])[2]").should('be.visible').click(); cy.wait(2000);
    //cy.screenshot('src-connector-view-full-configuration');
    cy.xpath("//button[text() = 'Close']").should('be.visible').click();



  });
});