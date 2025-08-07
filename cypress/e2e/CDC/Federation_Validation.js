/// <reference types="cypress" />

describe('Federation - Insert, Update, Delete, Add Column and Insert', () => {

  before(() => {
    cy.fixture('FederationData').then((config) => {
      // ✅ Load each key individually into Cypress.env()
      Object.entries(config).forEach(([key, value]) => {
        Cypress.env(key, value);
      });
    });
  });

  it('Logs into Federation Platform and runs queries', () => {
    const {
      URL,
      Username,
      Password,
      Username1,
      Password1,
      Project,
      srcConnectionName,
      srcSchemaName,
      srcTableName,
      tarConnectionName,
      tarSchemaName,
      tarTableName,
      InsertRecord,
      UpdateRecord,
      DeleteRecord,
      AddNewColumn,
      InsertRecordintoColumn
    } = Cypress.env();

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

    // ✅ Fix: use correct casing from fixture
    cy.visit(URL);
    cy.get('#username').type(Username);
    cy.get('#password').type(Password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    //------------------------------ Navigate to Connections --------------------------------
    // Click "Connections"
    cy.contains('span', 'Connections').should('be.visible').parent('a').click();
    cy.wait(2000);
    // Select "Transformation"
    cy.get('select.w-44').should('be.visible').select(Project);
    cy.wait(2000);

    // Navigate to Editor
    cy.xpath("//a[contains(@href, '/federation')]").click();
    cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();
    cy.wait(2000);

// ---- SELECT Source ----
    runQuery(`SELECT * FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName}`);
    cy.wait(5000);    
    
    // ---- SELECT Target ----
    runQuery(`SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`);
    cy.wait(5000);

    // ---- INSERT ----
    runQuery(`INSERT INTO ${srcConnectionName}.${srcSchemaName}.${srcTableName} ${InsertRecord}`);
    cy.wait(5000);

    // ---- UPDATE ----
    runQuery(`UPDATE ${srcConnectionName}.${srcSchemaName}.${srcTableName} SET ${UpdateRecord}`);
    cy.wait(5000);

    // ---- DELETE ----
    runQuery(`DELETE FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName} WHERE ${DeleteRecord}`);
    cy.wait(5000);

    // ---- ADD COLUMN ----
    runQuery(`ALTER TABLE ${srcConnectionName}.${srcSchemaName}.${srcTableName} ADD COLUMN ${AddNewColumn}`);
    cy.wait(5000);

    // ---- INSERT INTO NEW COLUMN ----
    runQuery(`INSERT INTO ${srcConnectionName}.${srcSchemaName}.${srcTableName} ${InsertRecordintoColumn}`);
    cy.wait(5000);

    // ---- SELECT Target ----
    runQuery(`SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`);
    cy.wait(5000);


    // Log out current user
    cy.xpath("(//div[@class='relative'])[2]").click();
    cy.xpath("//button[normalize-space(text())='Sign Out']").click();
    cy.wait(2000);

    // Login as Admin
    cy.visit(URL);
    cy.get('#username').type(Username1);
    cy.get('#password').type(Password1);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

// Click on "Data Governance" button
cy.xpath("//button[text()='Data Governance']").should('be.visible').click();

// Click the 5th button with class 'p-1'
cy.xpath("(//button[contains(@class, 'p-1')])[5]").should('be.visible').click();
cy.wait(2000);

// Click on the "Policy" link
cy.xpath("//a[contains(@href, '/datagovernance/data-shield/policy')]").should('be.visible').click();
cy.wait(2000);

// Search for policy "Geetha_V"
cy.xpath("//input[@placeholder='Search Policy']").should('be.visible').type("Geetha_V");

cy.get('.overflow-x-auto')
  .scrollTo('right', { duration: 800 }); // adjust duration as needed

cy.wait(2000);

// Click the search icon/button
cy.xpath("//button[@class = 'p-1.5 rounded-full hover:bg-gray-100']").should('be.visible').click();
cy.wait(2000);

// Click the first edit/view button from search result
cy.xpath("(//button[@class = 'p-1.5 rounded-lg hover:bg-gray-100 transition-colors'])[1]").should('be.visible').click();
cy.wait(2000);

for (let i = 0; i < 2; i++) {
  cy.xpath("//button[text() = 'Next']")
    .should('be.visible')
    .and('not.be.disabled')
    .click();
}

// Click "Next" twice
//cy.xpath("//button[text() = 'Next']").should('be.visible').click();
//cy.xpath("//button[text() = 'Next']").should('be.visible').click();
cy.wait(2000);

// Open the 4th dropdown
cy.xpath("(//div[@class = 'w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer h-10 flex items-center overflow-x-auto no-scrollbar'])[4]")
  .should('be.visible')
  .click();
  cy.wait(2000);

// Click "Select All" checkbox
cy.xpath("//span[text()='Select All']/preceding-sibling::input[@type='checkbox']")
  .should('be.visible')
  .check({ force: true }); // force in case it's hidden/style

// Wait 3 seconds (simulate Thread.sleep)
cy.wait(3000);

// Click to close dropdown
cy.xpath("(//div[@class = 'w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer h-10 flex items-center overflow-x-auto no-scrollbar'])[4]")
  .click();
  cy.wait(2000);

// Click to reopen dropdown
cy.xpath("(//div[@class = 'w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer h-10 flex items-center overflow-x-auto no-scrollbar'])[4]")
  .click();
  cy.wait(2000);

// Click "Select All" again
cy.xpath("//span[text()='Select All']/preceding-sibling::input[@type='checkbox']")
  .should('be.visible')
  .check({ force: true });
  cy.wait(2000);

// Click "Next" button 4 times
for (let i = 0; i < 4; i++) {
  cy.xpath("//button[text() = 'Next']")
    .should('be.visible')
    .and('not.be.disabled')
    .click();
}

// Click "Skip Reports"
cy.xpath("//button[text() = 'Skip Reports']")
  .should('be.visible')
  .and('not.be.disabled')
  .click();
cy.wait(2000);

// Click "Save Policy"
cy.xpath("//button[contains(text(), 'Save Policy')]")
  .should('be.visible')
  .and('not.be.disabled')
  .click();
cy.wait(2000);



cy.xpath("(//div[@class='relative'])[2]").click();

cy.xpath("//button[normalize-space(text())='Sign Out']").click();


// Login as Fed_user2
    cy.get('#username').type(Username);
    cy.get('#password').type(Password);
    cy.get('#remember-me').check();
    cy.get('button[type="submit"]').click();
    cy.wait(2000);

// Wait for 'Platform' button and click
cy.xpath("//button[text()='Platform']", { timeout: 10000 })
  .should('be.visible')
  .click();

// Click Federation menu item
cy.xpath("//a[contains(@href, '/federation')]").should('be.visible').click();

// Wait and click 'Editor'
cy.wait(1000); // or better: use element visibility check
cy.xpath("//div[contains(text(), 'Editor')]").should('be.visible').click();



  // ---- SELECT Source ----
  runQuery(`SELECT * FROM ${srcConnectionName}.${srcSchemaName}.${srcTableName}`);
    cy.wait(5000);    
    
  // ---- SELECT Target ----
  runQuery(`SELECT * FROM ${tarConnectionName}.${tarSchemaName}.${tarTableName}`);
    cy.wait(5000);

  


  });

});
