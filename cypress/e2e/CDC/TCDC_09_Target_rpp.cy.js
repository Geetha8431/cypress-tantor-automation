/// <reference types="cypress" />

describe('Target Connector Restart, Pause, Resume', () => {

  it('Logs into Tantor and Perform UI Actions', () => {
    // ✅ Load fixture and run test inside the callback
    cy.fixture('SRC_TAR_PRP').then((config) => {
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });

const { URL, Username, Password, Project, srcConnectionName, srcSchemaName, srcTableName, tarConnectionName, tarSchemaName, tarTableName,InsertRecord } = config;

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
cy.xpath("//a[@href='/cdc']").should('be.visible').click();
cy.wait(2000);
// Click the first 3 lines button
cy.xpath("(//button[@type = 'button'])[1]").should('be.visible').click();
cy.wait(2000);
// Click on the 3-dot menu in the first row (9th column)
cy.xpath("//table//tbody/tr[1]/td[9]").click();
// Click on the "View" button inside the dropdown or menu
cy.xpath("//button[@aria-label='View']").click();


// ---------- Restart Source Connector ---------------
cy.xpath("(//button[contains(., ' Restart')])[2]").should("be.visible").click();
cy.wait(2000);
cy.screenshot('tar-connector-restart');


// ---------- Pause Source Connector ----------------
cy.xpath("(//button[contains(., 'Pause')])[2]").should('be.visible').click();
cy.wait(2000);
cy.screenshot('ta-connector-pause');


// 🧭 Navigate to Federation > Editor
cy.xpath("//a[contains(@href, '/federation')]").click();
cy.wait(2000);
cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();


// --------- SELECT SRC Execution ---------
const selectSource = `SELECT * FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName}`;
// 2. Set the Ace editor value using JS
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue(selectSource);
  editor.navigateFileEnd();
});
cy.xpath("//div[@class='flex justify-between items-center']").click(); // Click Run
cy.xpath("//div[contains(@class, 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full')]").should('be.visible'); // Wait for results to be visible
cy.screenshot('src-table-before-insert');
cy.wait(2000);

// Clear the editor
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue('');
});


// --------- INSERT Execution ---------
const Insert = `INSERT INTO ${srcConnectionName}.${srcSchemaName}.${srcTableName} ${InsertRecord}`;
// 2. Set the Ace editor value using JS
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue(Insert);
  editor.navigateFileEnd();
});
cy.xpath("//div[@class='flex justify-between items-center']").click(); // Click Run
cy.xpath("//div[contains(@class, 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full')]").should('be.visible'); // Wait for results to be visible
cy.screenshot('src-table-after-insert');
cy.wait(2000);

// Clear the editor
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue('');
});


// --------- SELECT TAR Execution ---------
const selectTarget = `SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`;
// 2. Set the Ace editor value using JS
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue(selectTarget);
  editor.navigateFileEnd();
});
cy.xpath("//div[@class='flex justify-between items-center']").click(); // Click Run
cy.xpath("//div[contains(@class, 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full')]").should('be.visible'); // Wait for results to be visible
cy.screenshot('tar-table-after-src-insert');
cy.wait(2000);

// Clear the editor
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue('');
});


// Go to CDC Job page
cy.xpath("//a[@href='/cdc']").should('be.visible').click();
cy.wait(2000);
// Click the first 3 lines button
cy.xpath("(//button[@type = 'button'])[1]").should('be.visible').click();
cy.wait(2000);
// Click on the 3-dot menu in the first row (9th column)
cy.xpath("//table//tbody/tr[1]/td[9]").click();
// Click on the "View" button inside the dropdown or menu
cy.xpath("//button[@aria-label='View']").click();


//-------------- Resume Source Connector ----------------
cy.xpath("//button[contains(normalize-space(), 'Resume')]").should('be.visible').click();
cy.wait(2000);
cy.screenshot('tar-connector-resume');


// Navigate to Federation
cy.xpath("//a[contains(@href, '/federation')]").click();
cy.wait(2000);
// Click Editor
cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();


// --------- SELECT TAR Execution ---------
const selectTarget1 = `SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`;
// 2. Set the Ace editor value using JS
cy.window().then((win) => {
  const editor = win.ace.edit('editor');
  editor.setValue(selectTarget1);
  editor.navigateFileEnd();
});
cy.xpath("//div[@class='flex justify-between items-center']").click(); // Click Run
cy.xpath("//div[contains(@class, 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full')]").should('be.visible'); // Wait for results to be visible

cy.wait(10000);

cy.xpath("//div[@class='flex justify-between items-center']").click(); // Click Run
cy.xpath("//div[contains(@class, 'overflow-y-auto custom-scroll rounded-lg bg-white shadow h-full')]").should('be.visible'); // Wait for results to be visible
cy.screenshot('tar-table-after-src-resume');


});
});
});