/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Column HomePage - Table headers, Pagination, Search field, Refresh -> DC_13", () => {
  let userData;

  before(() => {
    cy.fixture("DataCatalogue/ColumnHomePage.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    // fresh login for every test
    cy.loginAs(userData.Role);
    cy.wait(500);

    // Always navigate to Business Catalogue page
    cy.contains("button", "Data Governance").click();
    cy.xpath("(//button[contains(@class, 'p-1')])[2]").click();
    cy.xpath("//a[@href='/datagovernance/data-catalogue/column']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/Column/i);
    // cy.screenshot("ColumnPage");
  });


  // ---------------------------- Table Headers --------------------------
  it("should display table headers correctly", () => {
    const headers = [
      "Id",
      "Name",
      "Diagram",
      "Joins",
      "Action"
    ];

    headers.forEach((header) => {
      cy.get("table thead")
      .contains(new RegExp(`^${header}$`, "i")) // 👈 case-insensitive regex
      .scrollIntoView().should("exist").should("be.visible");
    });
  });


  // --------------------------- Pagination -------------------------------
  it("should validate pagination correctly", () => {
    cy.verifyPagination("Column Page");
  });


  // ------------------------- Search Field -------------------------------
  it("Verify Search field functionality", () => {
    const searchInput = cy.xpath("//input[@placeholder='Search by Column Name']");
    const searchVal = userData.Searchvalue;

    searchInput.type(searchVal);

    // Test character-by-character typing style using fixture data (userData.CharByCharSearch)
    const charByChar = userData.CharByCharSearch; // Fallback
    searchInput.clear();
    for (let i = 0; i < charByChar.length; i++) {
      // Typing characters one by one to test the typing style
      searchInput.type(charByChar.charAt(i));
    }
    cy.wait(500);

    //Click Refresh and List should reload
    cy.get('button[title="Refresh"]').click();
    cy.wait(1000);
  });


});






