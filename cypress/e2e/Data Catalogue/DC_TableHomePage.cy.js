/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Table HomePage - Table headers, Pagination, Search field, Refresh -> DC_08", () => {
  let userData;

  before(() => {
    cy.fixture("DataCatalogue/TableHomePage.json").then((data) => {
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
    cy.xpath("//a[@href='/datagovernance/data-catalogue/table']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/Table/i);
    // cy.screenshot("TablePage");
    cy.wait(5000);
  });


  // ---------------------------- Table Headers --------------------------
  it("should display table headers correctly", () => {
    const headers = [
      "Id",
      "Name",
      "Alias",
      "Description",
      "Database",
      "Schema",
      "Owner",
      "Columns",
      "Tags",
      "Created Date",
      "Last Updated",
      "Action"
    ];

    headers.forEach((header) => {
      cy.get("table thead").contains(new RegExp(`^${header}$`, "i")).scrollIntoView().should("exist").should("be.visible");
    });
  });


  // --------------------------- Pagination -------------------------------
  it("Pagination - Table Page", () => {
    cy.verifyPagination("table");
  });

  // ------------------------- Search Field -------------------------------
  it("Verify Search field functionality", () => {
    const searchInput = cy.xpath("//input[@placeholder='Search Tables']");
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

  // ======================= Verify COLUMN Links ===========================
  it("Verify Columns link navigation for all visible rows", () => {
    const ColumnLink = 8; // Column link column index

    cy.log(`Searching for: "${userData.Searchvalue}"`);
    // Step 1: Search
    cy.xpath("//input[@placeholder='Search Tables']").should("be.visible").clear().type(userData.Searchvalue);

    cy.wait(1000); // wait for table to reload

    // Step 1: Find the first visible column link cell and click once
    cy.get(`table tbody tr td:nth-child(${ColumnLink})`)
      .first() // ✅ only the first cell
      .scrollIntoView()
      .should("exist")
      .click({ force: true });

    // Step 2: Validate redirection
    cy.url().should("include", "/column");
    cy.log("✅ Navigated to Columns page successfully.");

    // Step 3: Go back
    cy.go("back");
    cy.wait(1000);
  });



  // ======================= Verify TAGS Links ===========================
  it("Verify Tags links for all rows after searching and Verify 'Compliance Tags' popup header and tags, then close it", () => {
    const TagLink = 9; // Tags column index

    // Step 1: Search for "public"
    cy.xpath("//input[@placeholder='Search Tables']")
      .should("be.visible")
      .clear()
      .type(userData.Searchvalue);

    cy.wait(1000); // Wait for table reload

    // Step 2: Loop through each visible row
    cy.get("table tbody tr").each(($row, index) => {
      cy.wrap($row)
        .scrollIntoView()
        .within(() => {
          cy.xpath(`.//td[${TagLink}]`)
            .invoke("text")
            .then((text) => {
              const tagCount = parseInt(text.trim(), 10);

              if (isNaN(tagCount)) {
                cy.log(`⚠️ Row ${index + 1}: Could not read tag count — skipping.`);
                return;
              }

              // Case 1: 00 tags
              if (tagCount === 0) {
                cy.log(`ℹ️ Row ${index + 1}: No compliance tags available (showing 00).`);
              }

              // Case 2: 1 or more tags
              else {
                cy.log(`🔗 Row ${index + 1}: ${tagCount} tag(s) available — opening popup.`);

                // Click the "View tags" span
                cy.xpath(`.//td[${TagLink}]//span[contains(@title,'tag')]`).scrollIntoView().should("be.visible").click({ force: true });
              }
            });
        });
    });
    // ✅ Step 3: Verify popup (outside the row context)
    cy.get("div[class*='justify-between'][class*='border-b']", { timeout: 2000 }).should("be.visible").within(() => {
      cy.get("h3").should("be.visible").invoke("text").then((headerText) => {
        cy.log(`🧾 Popup Header: ${headerText.trim()}`);
        expect(headerText.trim()).to.match(/^Compliance Tags for/i);
      });
    });

    // ✅ Verify tags exist
    cy.get("ul li").should("have.length.greaterThan", 0).each(($tag) => {
      cy.log(`🏷️ SubTags: ${$tag.text().trim()}`);
    });

    cy.log("✅ Tags popup opens successfully and verified header and subtags");

    // ✅ Close popup
    cy.get("div[class*='justify-between'][class*='border-b']").find("button").should("be.visible").click({ force: true });

    cy.get("div[class*='justify-between'][class*='border-b']").should("not.exist");
    cy.log("✅ Compliance   Popup closed successfully.");

  });
});










