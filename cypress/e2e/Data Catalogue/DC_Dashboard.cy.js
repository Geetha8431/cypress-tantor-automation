/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("HomePage - Cards, Trend chart, Table headers, Recent Access, Pagination -> DC_01 ", () => {
  let userData;

  before(() => {
    cy.fixture("DataCatalogue/Dashboard.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    // fresh login for every test
    cy.loginAs(userData.Role);
    cy.wait(500);

    // Always navigate to Business Catalogue page
    cy.contains("button", "Data Governance").click();
    cy.xpath("//a[@href='/datagovernance/data-catalogue']").click();
    cy.url().should("include", "/datagovernance/data-catalogue");
    cy.wait(5000);
  });


  it("Verify summary cards and See Details navigation", () => {
    const cardUrls = {
      Database: "database",
      Schema: "schema",
      Tables: "table",      // ✅ singular
      Columns: "column",    // ✅ singular (if applicable)
    };

    const expectedTitles = Object.keys(cardUrls);

    cy.get("div.bg-white.rounded-lg.shadow-sm.border", { timeout: 10000 })
      .should("have.length.at.least", expectedTitles.length);

    expectedTitles.forEach((title, index) => {
      cy.log(`🔍 Checking card: ${title}`);

      cy.get("div.bg-white.rounded-lg.shadow-sm.border")
        .eq(index)
        .as("currentCard");

      cy.get("@currentCard").within(() => {
        cy.get("h3.text-lg.font-semibold")
          .should("be.visible")
          .and("have.text", title);

        cy.get("div.text-6xl.font-semibold.text-gray-800.mt-6")
          .should("be.visible")
          .invoke("text")
          .then((text) => {
            expect(text.trim()).to.match(/^\d+$/);
          });

        cy.contains("See details").should("be.visible").click({ force: true });
      });

      // ✅ Wait for correct URL pattern
      cy.url().should("include", `/datagovernance/data-catalogue/${cardUrls[title]}`);
      cy.wait(1000);

      // ✅ Return and wait for re-render
      cy.go("back");
      cy.url().should("include", "/datagovernance/data-catalogue");
      cy.wait(2000);
    });
  });


  it("Verify Catalogue Trend chart is visible and loaded", () => {
    // Check chart title is visible
    cy.contains(/catalogue\s*trend/i).should("be.visible");
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
    const headers = [
      "Id",
      "Connection Name",
      "Database",
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



  it("Pagination and Verify 10 records per page", () => {
    cy.wait(1000);

    // Step 1: Check initial state
    cy.get('button[title="Back"]').should('be.disabled');

    // Step 2: Capture row count on first page
    cy.get('table tbody tr').its('length').then((rowCount) => {
      cy.log(`🧾 Found ${rowCount} rows on first page`);

      if (rowCount < 10) {
        // Case A: Fewer than 10 connections (Next should be disabled)
        cy.get('button[title="Next"]').should('be.disabled');
        expect(rowCount).to.be.greaterThan(0);
        cy.log("✅ Fewer than 10 connections, pagination not needed.");
      } else {
        // Case B: More than 10 connections
        cy.get('button[title="Next"]').should('not.be.disabled');
        cy.get('table tbody tr').should('have.length', 10);

        // Step 3: Navigate through all pages
        const clickNextUntilDisabled = () => {
          cy.get('button[title="Next"]').then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click({ force: true });
              cy.wait(1500);
              cy.get('table tbody tr').should('have.length.at.most', 10);
              clickNextUntilDisabled();
            }
          });
        };

        const clickBackUntilDisabled = () => {
          cy.get('button[title="Back"]').then(($btn) => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click({ force: true });
              cy.wait(1500);
              cy.get('table tbody tr').should('have.length.at.most', 10);
              clickBackUntilDisabled();
            }
          });
        };

        cy.wait(1000);
        clickNextUntilDisabled();  // Go to last page
        cy.wait(1000);
        clickBackUntilDisabled();  // Return to first page
      }
    });
  });


});

