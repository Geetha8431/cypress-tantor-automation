/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("HomePage - Cards, Trend chart, Table headers, Recent Access, Pagination -> DC_01 ", () => {
    let userData;

    before(() => {
        cy.fixture("DG - Reports/Dashboard.json").then((data) => {
            userData = data;
        });
    });


    beforeEach(() => {
        // fresh login for every test
        cy.loginAs(userData.Role);

        // Always navigate to Business Catalogue page
        cy.contains("button", "Data Governance").click();
        cy.xpath("//a[@href='/datagovernance/reports']").click();
        cy.url().should("include", "/datagovernance/reports");
    });


    // --------------------------- Table Headers ------------------------------------
    it("should display table headers correctly", () => {
        const headers = [
            "S.No",
            "Owner",
            "Report Name",
            "Date",
            "Status",
            "Remarks",
            "Download"
        ];

        headers.forEach((header) => {
            cy.get("table thead th").contains(header, { matchCase: false }).should("exist");
        });
    });

    // ------------------------------------ Search field -----------------------------
    it("Verify Search field functionality and Refresh button", () => {
        const searchInput = cy.xpath("//input[@placeholder='Search reports...']");
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
        cy.get('button[title="Refresh"]').click();
        //cy.screenshot("Refresh");
    });

    // ----------------------------------- Pagination -------------------------------
    it("should validate pagination correctly", () => {
        cy.verifyPagination("ReportsPage");
    });

    // ------------------------ Refresh, Path, and Page Name ------------------------------------
    it("Path/Breadcrumb, Page name and it's content visibility", () => {
        cy.get('nav[aria-label="breadcrumb"]').should('contain.text', 'Data Governance').and('contain.text', 'Reports');

        cy.contains("h1", "Reports").should("be.visible");
        cy.contains("p", "Generate and view data governance reports and analytics.").should("be.visible");
    });


    // -------------------------------- Clumn Sorting ---------------------------------------
    it("Column Sorting - Verify Ascending and Descending on column", () => {
        const headerName = userData.TableHeadertoSort.trim();
        // Step 1: Find the column header & alias it
        cy.log("Storing the header name in sortHeader to reuse");
        cy.get("table thead th").contains(new RegExp(headerName, "i")).as("sortHeader");

        // Step 2: ASCENDING (1 click)
        cy.log("Ascending sorting");
        cy.get("@sortHeader").click();

        cy.get("@sortHeader").invoke("index").then((colIndex) => {
            const column = colIndex + 1;
            cy.get(`table tbody tr td:nth-child(${column})`).then(($cells) => {
                const ascValues = [...$cells].map(c => c.innerText.trim());

                cy.log("===== ASCENDING VALUES =====");
                ascValues.forEach((val, i) => cy.log(`Row ${i + 1}: ${val}`));

                cy.log("ASCENDING values:", ascValues);
            });
        });

        // Step 3: DESCENDING (2nd click on SAME header)
        cy.log("Descending sorting");
        cy.get("@sortHeader").click();

        cy.get("@sortHeader").invoke("index").then((colIndex) => {
            const column = colIndex + 1;
            cy.get(`table tbody tr td:nth-child(${column})`).then(($cells) => {
                const descValues = [...$cells].map(c => c.innerText.trim());

                cy.log("===== DESCENDING VALUES =====");
                descValues.forEach((val, i) => cy.log(`Row ${i + 1}: ${val}`));

                cy.log("DESCENDING values:", descValues);
            });
        });

    });
});

