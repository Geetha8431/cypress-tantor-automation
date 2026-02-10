/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("DatabaseHomePage - Cards, Trend chart, Table headers, Recent Access, Pagination, Search field, Refresh -> DC_02 ", () => {
  let userData;

  before(() => {
    cy.fixture("DataCatalogue/DatabaseHomePage.json").then((data) => {
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
    cy.xpath("//a[@href='/datagovernance/data-catalogue/database']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/database/i);
    // cy.screenshot("DatabasePage");
    cy.wait(5000);
  });

/*

  it("Verify summary cards and See Details navigation", () => {
    const cardUrls = {
      Oracle: "database",
      Postgres: "database",
      MySQL: "database",
      Hive: "database",
    };

    const expectedTitles = Object.keys(cardUrls);

    cy.get("div.bg-white.rounded-lg.shadow-sm.border", { timeout: 10000 })
      .should("have.length.at.least", expectedTitles.length);

    expectedTitles.forEach((title, index) => {
      cy.log(`🔍 Checking card: ${title}`);

      cy.get("div.bg-white.rounded-lg.shadow-sm.border").eq(index).as("currentCard");

      // 👉 All card checks stay inside "within"
      cy.get("@currentCard").within(() => {
        cy.get("h3.text-lg.font-semibold")
          .scrollIntoView()
          .should("be.visible")
          .and("have.text", title);


        cy.get("div.text-6xl.font-semibold.text-gray-800.mt-6")
          .should("be.visible")
          .invoke("text")
          .then((text) => {
            expect(text.trim()).to.match(/^\d+$/);
          });

        cy.get("button:contains('See details')").as("detailsBtn");
      });

      // ✅ Back outside "within"
      cy.get("@detailsBtn").then(($btn) => {
        if ($btn.is(":disabled")) {
          cy.log(`ℹ️ '${title}' card is disabled (no navigation).`);
        } else {
          cy.wrap($btn).click({ force: true });

          // Wait for the new page
          cy.url().should("include", `/datagovernance/data-catalogue/${cardUrls[title]}`);
          cy.get("body").should("be.visible"); // wait for page content to render

          // Optional: ensure grid or toolbar visible
          cy.xpath("//button[@title='Grid View']").should("be.visible").click();

        }
      });
    });
  });


  it("Verify Catalogue Trend chart is visible and loaded", () => {
    // Check chart title is visible
    cy.contains(/database \s*trend/i).should("be.visible");
    cy.xpath("//div[@class = 'bg-white p-6 rounded-lg shadow']").should("be.visible");

    // Step 3: Hover over the target element (the 4th relative div)
    cy.xpath("//div[@class='relative cursor-help']")
      .scrollIntoView()
      .should("exist")
      .trigger("mouseover");

    // Step 4: Wait a bit for hover details to appear (UI animation, etc.)
    cy.wait(500);

    // Step 5: Verify tooltip / popover / hover content is visible
    cy.xpath("//div[contains(@class,'absolute') or contains(@class,'tooltip') or contains(@class,'popover')]")
      .should("be.visible");
  });


  it("should display table headers correctly", () => {
    cy.xpath("//button[@title='List View']").click();

    const headers = [
      "Id",
      "Name",
      "Alias",
      "Description",
      "Owner",
      "Schema",
      "Tables",
      "Columns",
      "Created Date",
      "Updated Date"
    ];

    headers.forEach((header) => {
      cy.get("table thead").contains(header).should("exist");
    });
  });


  it("Recent Access - verify visibility and hover details", () => {
    // Step 1: Verify the heading text
    cy.contains(/Recent\s*access/i).should("be.visible");
    // Step 2: Verify the box is visible
    cy.xpath("//div[@class='bg-white p-6 rounded-lg']").should("be.visible");
    // Step 3: Hover over the target element (the 4th relative div)
    cy.xpath("(//div[@class='relative'])[4]")
      .scrollIntoView()
      .should("exist")
      .trigger("mouseover");

    // Step 4: Wait a bit for hover details to appear (UI animation, etc.)
    cy.wait(500);

    // Step 5: Verify tooltip / popover / hover content is visible
    cy.xpath("//div[contains(@class,'absolute') or contains(@class,'tooltip') or contains(@class,'popover')]")
      .should("be.visible");

    // cy.screenshot("RecentAccessHover");

  });


  it("Pagination - Database Page", () => {
    cy.xpath("//button[@title='List View']").click();
    cy.verifyPagination("database");
  });


  it("Verify Search field functionality", () => {
    cy.xpath("//button[@title='List View']").click();
    const searchInput = cy.xpath("//input[@placeholder='Search connections...']");
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

*/

  it("Verify Links navigation (Schema, Tables, Columns)", () => {
    const linkColumns = [6, 7, 8]; // Schema, Tables, Columns

    linkColumns.forEach((colIndex) => {
      // Always return to the list view before next click
      cy.xpath("//button[@title='List View']").should("be.visible").click();
      cy.wait(5000);

      // Search for the connection again
      cy.xpath("//input[@placeholder='Search connections...']")
        .should("be.visible")
        .clear()
        .type(userData.Searchvalue);

      // Wait for the specific DB to appear and click the target column
      cy.contains("td", new RegExp(userData.Searchvalue, "i"), { timeout: 10000 })
        .should("be.visible")
        .parents("tr")
        .within(() => {
          cy.xpath(`.//td[${colIndex}]/a | .//td[${colIndex}]`).scrollIntoView({ ensureScrollable: true })   // 👈 force scroll
          .should("be.visible")
          .click({ force: true });  
        });

      // ✅ Validate navigation
      if (colIndex === 6) {
        cy.url().should("include", "/schema");
      } else if (colIndex === 7) {
        cy.url().should("include", "/table");
      } else if (colIndex === 8) {
        cy.url().should("include", "/column");
      }

      // Go back for next iteration
      cy.go("back");
    });
  });
});

