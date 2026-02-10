/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Glossary-HomePage - search, refresh, pagination, headers, column sorting, Cards -> BC_07 ", () => {
    let userData; 

  before(() => {
    cy.fixture("Glossary/HomePage.json").then((data) => {
      userData = data; 
    });
  });

  beforeEach(() => {
    // fresh login for every test
    cy.loginAs(userData.Role); 
    cy.wait(2000); 

    // Always navigate to Business Catalogue page
    cy.contains("button", "Data Governance").click();
    cy.xpath("(//button[contains(@class, 'p-1')])[5]").click();
    cy.xpath("//a[@href='/datagovernance/business-catalogue/glossary']").click();
  });


    it("Verify Search field functionality", () =>{
        const searchInput = cy.xpath("//input[@placeholder='Search Glossary...']");

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
        const charByChar = userData.CharByCharSearch; // Fallback
        searchInput.clear();
        for (let i = 0; i < charByChar.length; i++) {
            // Typing characters one by one to test the typing style
            searchInput.type(charByChar.charAt(i)); 
        }
        cy.wait(1000); 
    });


  it("Verify Refresh button and Path/Breadcrumb visibility", () =>{
    cy.get('button[title="Refresh"]').click(); 
    cy.wait(1000);
    //cy.screenshot("Refresh");
    // Verify the breadcrumb container and its content 
    cy.get('nav[aria-label="breadcrumb"]').should('contain.text', 'Data Governance').
    and('contain.text', 'Business catalogue').and('contain.text', 'Glossary');
  });

  
  it("Pagination and Verify 10 records per page", () => {
    cy.wait(500);
    // Ensure Back is disabled initially
    cy.get('button[title="Back"]').should('be.disabled');

    // Function to click "Next" until disabled
    const clickNextUntilDisabled = () => {
      cy.get('button[title="Next"]').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click({ force: true });
          cy.wait(1000); // wait for data load
          clickNextUntilDisabled(); // recurse
        }
      });
    };
    // Function to click "Back" until disabled
    const clickBackUntilDisabled = () => {
      cy.get('button[title="Back"]').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click({ force: true });
          cy.wait(1000);
          clickBackUntilDisabled();
        }
      });
    };

    cy.wait(1000);
    clickNextUntilDisabled(); // Navigate to the last page

    cy.wait(1000);
    clickBackUntilDisabled(); // Navigate back to the first page

    cy.get('table tbody tr').should('have.length', 10); // Verify 10 records per page (or adjust if different)
  });



  it("Download Business Glossary Lists", () => {
    const searchInput = cy.xpath("//input[@placeholder='Search Glossary...']");

    //Download Full Business Glossary Lists 
    cy.get('button[title="Download as CSV"]').click();
    cy.wait(1000);

    // 🔹 Download filtered list for only one search term
    const searchTerm = userData.Searchvalue; // pick one term from fixture
    searchInput.clear().type(searchTerm);

    cy.log(`🔍 Searching for: ${searchTerm}`);

    // Download filtered result
    cy.get('button[title="Download as CSV"]').click();
    cy.wait(1500);
    cy.log(`📥 Downloaded filtered list for: ${searchTerm}`);
  });


  it("Verify table headers in Business Glossary", () => {  
    const expectedHeaders = [
    "Id",
    "Name",
    "Description",
    "Status",
    "Domain",
    "Asset Type",
    "Quick Action"
  ];

    // Select all <span> inside <th> headers
    cy.xpath("//table//thead//tr//th//span")
      .should("have.length", expectedHeaders.length)
      .each(($span, index) => {
        cy.wrap($span)
          .invoke("text")
          .then((text) => {
            const actual = text.replace(/\s+/g, " ").trim(); // Normalize spaces (e.g., replace multiple spaces with single space) and trim
            expect(actual).to.eq(expectedHeaders[index]);  // Compare case-insensitively
          });
      });
  });


   it("Verify Ascending and Descending sorting for string column from JSON", () => {
    const columnName = userData.columnToSort;

    if (!columnName) {
      throw new Error("Column name not defined in fixture");
    }

    // Wait for table rows to load
    cy.get("table tbody tr").should("exist");

    cy.get("table thead tr th span").then(($headers) => {
      // Find column index dynamically (1-based)
      const columnIndex = [...$headers].findIndex((th) => {
        const text = th.innerText?.trim();
        return text && text.toLowerCase() === columnName.toLowerCase();
      }) + 1;

      if (columnIndex === 0) {
        throw new Error(`Column "${columnName}" not found in the table`);
      }

      // ----- ASCENDING -----
      cy.contains("th span", new RegExp(`^\\s*${columnName}\\s*$`, "i")).click();
      cy.wait(1000); // wait for table sort

      cy.get(`table tbody tr td:nth-child(${columnIndex})`).then(($cells) => {
        const actual = [...$cells].map((cell) => cell.innerText.trim());
        const expected = [...actual].sort((a, b) => a.localeCompare(b));
        expect(actual).to.deep.equal(expected);
        cy.log(`✅ Ascending order verified for column: ${columnName}`);
      });

      // ----- DESCENDING -----
      cy.contains("th span", new RegExp(`^\\s*${columnName}\\s*$`, "i")).click();
      cy.wait(1000);

      cy.get(`table tbody tr td:nth-child(${columnIndex})`).then(($cells) => {
        const actual = [...$cells].map((cell) => cell.innerText.trim());
        const expected = [...actual].sort((a, b) => b.localeCompare(a));
        expect(actual).to.deep.equal(expected);
        cy.log(`✅ Descending order verified for column: ${columnName}`);
      });
    });
  });

  
  it("Search value and click View action details", () =>{
    // ✅ Use value from fixture
    const Searchvalue = userData.Searchvalue;  
    cy.xpath("//input[@placeholder='Search Glossary...']").type(Searchvalue);
    cy.get('button[title="View Details"]').click();
  });
});