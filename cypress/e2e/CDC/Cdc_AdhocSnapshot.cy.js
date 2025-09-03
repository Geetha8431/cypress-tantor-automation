/// <reference types="cypress" />

describe('Adhoc Snapshot', () => {

  it('Logs into Tantor and Perform UI Actions', () => {
    // ✅ Load fixture and run test inside the callback
    cy.fixture('Adhoc_snapshot').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });

      const { URL, Username, Password, Project, srcConnectionName, srcSchemaName, srcTableName, 
        tarTableName, tarConnectionName, tarSchemaName, InsertRecord
      } = config;


//---------------------------------- Run Query Script ----------------------------------------
  const runQuery = (query) => {
    cy.window().then((win) => {
      const editor = win.ace.edit('editor');
      editor.setValue(query);
      editor.navigateFileEnd();
    });
    cy.xpath("//div[@class='flex justify-between items-center']").click(); // Run button
    cy.xpath("//div[@class = 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full']").should('be.visible');
    cy.wait(1000); // Optional buffer
  };


//--------------------------------- Login to Tantor -------------------------------------------
cy.visit(URL);
cy.get('#username').type(Username);
cy.get('#password').type(Password);
cy.get('#remember-me').check();
cy.get('button[type="submit"]').click();
cy.url().should('include', '/dashboard');


//------------------------------ Navigate to Connections ---------------------------------------
// Click "Connections"
cy.contains('span', 'Connections').should('be.visible').parent('a').click();
cy.wait(2000);
// Select "Transformation"
cy.get('select.w-44').should('be.visible').select(Project);
cy.screenshot('project-selection');


// -------------------------- Navigate to Federation > Editor -----------------------------------
cy.xpath("//a[contains(@href, '/federation')]").click();
cy.wait(2000);
cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();


// ------------------------------- SELECT SRC Execution ------------------------------------------
runQuery(`SELECT * FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName}`);
cy.screenshot('select-src-before-insert');


// --------------------------------------- INSERT Execution ---------------------------------------
runQuery(`INSERT INTO ${srcConnectionName}.${srcSchemaName}.${srcTableName} ${InsertRecord}`);
cy.screenshot('insert-into-src');

cy.wait(30000);

// ---------------------------------- SELECT TAR Execution ----------------------------------------
runQuery(`SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`);
cy.screenshot('select-tar-after-insert');


// --------------------------------- Navigate to CDC job ------------------------------------------
// Go to CDC Job page
cy.xpath("//a[@href='/cdc']").should('be.visible').click();
cy.wait(2000);
// Click the first 3 lines button
cy.xpath("(//button[@type = 'button'])[2]").should('be.visible').click();
cy.wait(2000);
// Click on the 3-dot menu in the first row (9th column)
cy.xpath("//table//tbody/tr[1]/td[9]").click();
// Click on the "View" button inside the dropdown or menu
cy.xpath("//button[@aria-label='View']").click();


//----------------------------------- Adhoc Snapshot -----------------------------------------------
cy.xpath("//Button[text() = 'Adhoc Snapshot']").should('be.visible').click();
cy.screenshot('after-clicking-adhoc-snapshot');


// -------------------------- Again Navigate to Federation > Editor --------------------------------
cy.xpath("//a[contains(@href, '/federation')]").click();
cy.wait(2000);
cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();


// ------------------------------- SELECT SRC Execution ---------------------------------------------
runQuery(`SELECT * FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName}`);
cy.screenshot('select-src-after-clicking-adhoc-snapshot');

cy.wait(10000);

// ---------------------------------- SELECT TAR Execution ------------------------------------------
runQuery(`SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`);
cy.screenshot('select-tar-after-clicking-adhoc-snapshot'); 



 });
});
});