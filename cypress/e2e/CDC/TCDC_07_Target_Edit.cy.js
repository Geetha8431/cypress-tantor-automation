/// <reference types="cypress" />

describe('Target Connector Edit', () => {

  let userData;

  before(() => {
    cy.fixture("CDC/TAR_Connector_Edit.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    cy.loginAs(userData.Role);
  });


  it('Logs into Tantor and Perform UI Actions', () => {

    // 🔁 Reusable helper to update config fields
    const updateDatabaseConfig = ({ DBURL, user, pass }) => {
      cy.xpath("//label[text()='connection.url']/following-sibling::input").should('be.visible').clear().type(DBURL);
      cy.xpath("//label[text()='connection.username']/following-sibling::input").should('be.visible').clear().type(user);
      cy.xpath("//label[text()='connection.password']/following-sibling::input").should('be.visible').clear().type(pass);
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
    cy.xpath("//table//tbody/tr[1]/td[9]", { timeout: 20000 }).should('be.visible').click(); // Click on the 3-dot menu in the first row (9th column)
    cy.xpath("//button[@aria-label='View']", { timeout: 20000 }).should('be.visible').click(); // Click on the "View" button inside the dropdown or menu

    cy.wait(1000);
    //------------------ Edit Config with Invalid Values -----------------
    cy.xpath("(//button[contains(., 'Edit')])[2]").should('exist').click(); // Click Target Edit
    cy.xpath("//button[contains(text(), ' Edit')]").should('be.visible').click(); // Again Click Edit button

    // Edit Config with Invalid Values
    updateDatabaseConfig(userData.invalidConfig);

    cy.xpath("//button[contains(., 'Save Changes')]").should('be.visible').click(); 
    cy.wait(500);
    //cy.screenshot('tar-connector-after-save-1');
    cy.xpath("//button[contains(., 'Cancel')]").should('be.visible').click(); //Cancel
    cy.reload(); //Browser Refresh
    cy.wait(500);

    // Target change to Yellow color
    //cy.screenshot('tar-connector-failed-task');

    // View Source Configuration after ivalid entries
    cy.xpath("(//button[contains(., 'View full configuration')])[2]").should('be.visible').click(); 
    cy.wait(500);
    //cy.screenshot('tar-connector-view-full-configuration-1');
    cy.xpath("//button[text() = 'Close']").should('be.visible').click();


    //------------------ Edit Config with valid Values -----------------
    cy.xpath("(//button[contains(., 'Edit')])[2]").should('be.visible').click();
    cy.xpath("//button[contains(text(), ' Edit')]").should('be.visible').click();

    updateDatabaseConfig(userData.validConfig);

    cy.xpath("//button[contains(., 'Save Changes')]").should('be.visible').click(); cy.wait(500);
    //cy.screenshot('tar-connector-after-save-2');
    cy.xpath("//button[contains(., 'Cancel')]").should('be.visible').click(); cy.wait(2000);
    cy.reload(); //Browser Refresh

    cy.wait(2000);

    cy.xpath("(//button[contains(., 'View full configuration')])[2]").should('be.visible').click(); cy.wait(500);
    //cy.screenshot('tar-connector-view-full-configuration-2');
    cy.xpath("//button[text() = 'Close']").should('be.visible').click();



  });
});