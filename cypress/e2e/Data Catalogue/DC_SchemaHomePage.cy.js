/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Schema HomePage - Table headers, Pagination, Search field, Refresh -> DC_05", () => {
  let userData;

  before(() => {
    cy.fixture("DataCatalogue/SchemaHomePage.json").then((data) => {
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
    cy.xpath("//a[@href='/datagovernance/data-catalogue/schema']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/Schema/i);
    // cy.screenshot("DatabasePage");
    cy.wait(5000);
  });

  // ------------------------- Table Headers --------------------------------
  it("should display table headers correctly", () => {
    const headers = [
      "Id",
      "Name",
      "Description",
      "Database",
      "Owner",
      "Tables",
      "Columns",
      "Created Date",
      "Last Updated Date"
    ];

    cy.get("table thead th").then(($ths) => {
      const textArray = [...$ths].map((th) => th.innerText.trim());
      headers.forEach((header) => {
        expect(textArray).to.include(header);
      });
    });
  });

  // ----------------------------------- Pagination -------------------------------
  it("Pagination - Schema Page", () => {
    cy.wait(2000);
    cy.verifyPagination("schema");
  });


  // ------------------------------------ Search field -----------------------------
  it("Verify Search field functionality", () => {
    const searchInput = cy.xpath("//input[@placeholder='Search schema ...']");
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

  // ------------------------- Table and Column links ----------------------------------
  it("Verify Links navigation (Tables, Columns)", () => {
    const linkColumns = [6, 7]; // Tables, Columns

    linkColumns.forEach((colIndex) => {
      // Search for the connection again
      cy.xpath("//input[@placeholder='Search schema ...']")
        .should("be.visible")
        .clear()
        .type(userData.Searchvalue);

      // Wait for the specific DB to appear and click the target column
      cy.contains("td", new RegExp(`^${userData.Searchvalue}$`, "i"), { timeout: 10000 })
        .should("be.visible")
        .parents("tr")
        .within(() => {
          cy.xpath(`.//td[${colIndex}]/a | .//td[${colIndex}]`)
            .should("be.visible")
            .click();
        });
      // ✅ Correct version
      if (colIndex === 6) {
        cy.url().should("include", "/table");
      } else if (colIndex === 7) {
        cy.url().should("include", "/column");
      }

      // Go back for next iteration
      cy.go("back");
    });
  });


});





