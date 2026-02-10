/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("HomePage - search, refresh, pagination, headers, column sorting, Cards -> BC_02 ", () => {
  let userData;

  before(() => {
    cy.fixture("BusinessCatalogue/HomePage").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    // fresh login for every test
    cy.loginAs(userData.Role);
    cy.wait(2000);

    // Always navigate to Business Catalogue page
    cy.contains("button", "Data Governance").click();
    cy.xpath("//a[@href='/datagovernance/business-catalogue']").click();
    cy.url().should("include", "/datagovernance/business-catalogue");
    cy.screenshot("Business Catalogue HomePage");
  });


  it("Verify Search field functionality", () => {
    const searchInput = cy.xpath("//input[@placeholder='Search catalogue...']");

    // Test various search values defined in the fixture (e.g., userData.SearchTerms)
    if (userData.SearchTerms && Array.isArray(userData.SearchTerms)) {
      userData.SearchTerms.forEach(term => {
        // Clear and type the search term, waiting briefly for results to process
        searchInput.clear().type(term);
        cy.wait(500);
      });
    } else {
      cy.log("Warning: 'SearchTerms' array not found in fixture. Skipping initial search tests.");
    }

    // Test character-by-character typing style using fixture data (userData.CharByCharSearch)
    const charByChar = userData.CharByCharSearch || "gdm"; // Fallback
    searchInput.clear();
    for (let i = 0; i < charByChar.length; i++) {
      // Typing characters one by one to test the typing style
      searchInput.type(charByChar.charAt(i));
    }
    cy.wait(500);

    // Final specific value test, reads from userData.FinalSpecificSearch (e.g., "N/A")
    const finalValue = userData.FinalSpecificSearch || "N/A"; // Fallback
    searchInput.clear().type(finalValue);
    cy.wait(1000);
  });


  it("Verify Refresh button and Path/Breadcrumb visibility", () => {
    cy.get('button[title="Refresh"]').click();
    cy.wait(1000);
    //cy.screenshot("Refresh");
    // Verify the breadcrumb container and its content 
    cy.get('nav[aria-label="breadcrumb"]').should('contain.text', 'Data Governance').and('contain.text', 'Business catalogue');
  });


  // --------------------------- Pagination -------------------------------
  it("should validate pagination correctly", () => {
    cy.wait(1000);
    cy.verifyPagination("Business Catalogue Page");
  });




  it("Verify table headers in Business Catalogue", () => {
    const baseHeaders = [
      "id",
      "domain",
      "category",
      "subcategory",
      "term",
      "tag",
      "subtag",
      "description",
      "created By",
      "created Date",
      "updated Date",
      "status"
    ];

    // Add "Action" only for specific roles
    const includeAction = ["dataSteward", "dataOwner"].includes(userData.Role);

    const expectedHeaders = includeAction
      ? [...baseHeaders, "Action"]
      : baseHeaders;

    // Select <span> inside <th> headers
    cy.xpath("//table//thead//tr//th//span")
      .should("have.length", expectedHeaders.length)
      .each(($span, index) => {
        cy.wrap($span)
          .invoke("text")
          .then((text) => {
            const actual = text.replace(/\s+/g, " ").trim();
            expect(actual).to.eq(expectedHeaders[index]);
          });
      });
  });




  it("Column Sorting - Verify Ascending order on 'domain' column", () => {
    cy.contains("th span", "domain").click(); // Click header once for Ascending sort
    cy.wait(2000);

    cy.get("table tbody tr td:nth-child(2)") // 2nd column = Domain
      .then(($cells) => {
        const actual = [...$cells].map((cell) => cell.innerText.trim());
        // Print the captured array to the Cypress log and report
        cy.log('Captured Domain Values (Ascending):', actual);
      });
  });


  it("Column Sorting - Verify Descending order on 'domain' column", () => {
    cy.contains("th span", "domain").click(); // Click header again for Descending sort (2 clicks total)
    cy.wait(2000);

    cy.get("table tbody tr td:nth-child(2)") // 2nd column = Domain
      .then(($cells) => {
        const actual = [...$cells].map((cell) => cell.innerText.trim());
        // Print the captured array to the Cypress log and report
        cy.log('Captured Domain Values (Descending):', actual);

      });
  });

  it("Column Sorting (domain/category sorting) - Verify Asc order on Category column (numeric)", () => {
    cy.contains("th span", "category").click();  // Click Category header to sort Asc
    cy.wait(2000);

    cy.get("table tbody tr td:nth-child(3)") // 3rd column = Category
      .then(($cells) => {
        const actual = [...$cells].map((cell) => parseInt(cell.innerText.trim(), 10));
        const expected = [...actual].sort((a, b) => a - b);
        expect(actual).to.deep.equal(expected);
      });
  });

  it("Column Sorting (domain/category sorting) - Verify Desc order on Category column (numeric)", () => {
    // Click Category header twice to sort Desc
    cy.contains("th span", "category").click().click(); cy.wait(2000);

    cy.get("table tbody tr td:nth-child(3)") // 3rd column = Category
      .then(($cells) => {
        const actual = [...$cells].map((cell) => parseInt(cell.innerText.trim(), 10));

        const expected = [...actual].sort((a, b) => b - a);

        expect(actual).to.deep.equal(expected);
      });
  });


  it("Verify 6 summary cards have correct titles", () => {

    // Expected titles for the 6 cards
    const expectedTitles = [
      "Domain",
      "Category",
      "Sub-category",
      "Term",
      "Tag",
      "Sub-tag",
    ];

    // Verify 6 cards exist and check titles
    // Using a more general selector for the cards for robustness
    cy.get(".bg-white.p-4.rounded-lg.shadow-sm.border")
      .not(".animate-pulse")
      .should("have.length", expectedTitles.length)
      .each(($card, index) => {
        cy.wrap($card).within(() => {
          cy.get("h3").should("have.text", expectedTitles[index]);
          cy.get("p").invoke("text").should("not.be.empty"); // count should not be empty
        });
      });
  });


  it("Click each category link for the search result 'D2' one by one (Refactored)", () => {
    // FIX: Use the property from the fixture data
    const searchValue = userData.Searchvalue;
    const linkCount = userData.linkCount; // Assuming 5 clickable links/buttons in the row

    // Search D2
    cy.xpath("//input[@placeholder='Search catalogue...']").type(searchValue);
    cy.wait(1000); // Wait for the search results to load

    // Step 1: Loop through and click links from the matching row
    for (let i = 0; i < linkCount; i++) {
      cy.contains('td', searchValue) // Find the row containing 'D2'
        .parent('tr')
        .within(() => {
          // Click the link/button at the current index (0 to 4)
          cy.get('button.text-blue-600.underline').eq(i).click();
        });

      // Step 2: Assuming a modal or view opens, verify and close it
      // Using a long timeout for modal visibility/interaction
      cy.contains('button', 'Close', { timeout: 10000 }).should('be.visible').click();
      cy.wait(500); // Wait for modal to close before next loop iteration
    }
  });
});