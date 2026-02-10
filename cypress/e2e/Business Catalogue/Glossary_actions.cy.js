/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Glossary-HomePage - search, refresh, pagination, headers, column sorting, Cards -> BC_08", () => {
    let userData; 

  before(() => {
    cy.fixture("Glossary/Actions.json").then((data) => {
      userData = data; 
    });
  });

  beforeEach(() => {
    // fresh login for every test
    cy.loginAs(userData.Role); 
    cy.wait(500); 

    // Always navigate to Business Catalogue page
    cy.contains("button", "Data Governance").click();
    cy.xpath("(//button[contains(@class, 'p-1')])[5]").click();
    cy.xpath("//a[@href='/datagovernance/business-catalogue/glossary']").click();
  });

  it("Search value and click View action details and verify all elements on the page", () =>{
    // Step 1: Search for category
    cy.xpath("//input[@placeholder='Search Glossary...']").type(userData.SearchActivevalue);

    // Step 2: Click View Details button
    cy.get('button[title="View Details"]').first().click();

    //cy.screenshot("ActiveAssetPage");

    // Step 3: Verify Category ID page is open
    cy.url().should(
  'match',
  /\/datagovernance\/business-catalogue\/glossary\/(category|domain|subcategory|term|tag|subtag)/
);//URL check
    cy.xpath("//div[@class='flex-grow bg-white px-6 py-3 rounded-lg shadow']").should("exist"); // details page check
    cy.xpath("//div[@class='bg-white p-5 rounded-lg shadow-sm text-sm']").should("exist"); //Metadata check

function clickButtonsWith1(index = 0) {
  cy.xpath("//table//button[not(@disabled) and text()='1']")
    .then(($buttons) => {
      if (index >= $buttons.length) return; // stop if no more buttons
      cy.wrap($buttons[index]).click();

      // Wait for details page
      cy.xpath("//div[@class='mt-6']", { timeout: 10000 }).should("be.visible");

      // Click "See Details"
      cy.xpath("//button[@title='See Details']").click();

      // Verify URL and page content
      cy.url().should(
        'match',
        /\/datagovernance\/business-catalogue\/glossary\/(category|domain|subcategory|term|tag|subtag)/i
      );
      cy.xpath("//div[@class='flex-grow bg-white px-6 py-3 rounded-lg shadow']").should("exist");
      cy.xpath("//div[@class='bg-white p-5 rounded-lg shadow-sm text-sm']").should("exist");

      // Go back to table
      cy.xpath("//button[@title='Back']").click();

      // Reapply filters if needed
      cy.xpath("//button[text() = 'Category']").click();
      cy.xpath("//button[text() = 'Sub-category']").click();
      cy.xpath("//button[text() = 'Tag']").click();
      cy.xpath("//button[text() = 'Sub-tag']").click();

      // Click next button recursively
      clickButtonsWith1(index + 1);
    });
}
// Use in your test:
clickButtonsWith1();

cy.xpath("//button[contains(text(), 'Technical')]").click();
cy.wait(2000);
cy.xpath("//div[@class='mt-4']").should("exist");

});

  it("Search inactive asset value and clik quick action arrow", () =>{
    cy.xpath("//input[@placeholder='Search Glossary...']").type(userData.Search_InactiveValue);

    cy.get('button[title="View Details"]').first().click();
    //cy.screenshot("InactiveAssetPage");
  });


    it("Search Awaiting Approval asset value and clik quick action arrow", () =>{
    cy.xpath("//input[@placeholder='Search Glossary...']").type(userData.Search_AwaitingApprovalValue);

    cy.get('button[title="View Details"]').first().click();
    //cy.screenshot("InactiveAssetPage");
  });


});