/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Report Generate -> DG_R02 ", () => {
    let userData;

    before(() => {
        cy.fixture("DG - Reports/GenerateReport.json").then((data) => {
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



    function selectFromDropdown(value) {
        cy.contains("ul li label span", new RegExp(`^${value}$`, "i"))
            .should("be.visible")
            .parents("label")
            .find("input[type='checkbox']")
            .check({ force: true });
    }


    it("Generate report pop up visibility check", () => {
        cy.xpath("//button[@title='Generate Report']/span[contains(text(),'Generate Report')]").click();

        cy.get("div.fixed.right-0.top-0").should("be.visible");

        // Verify popup title
        cy.contains("h2", "Generate Report").should("be.visible");

        // Verify mandatory field: Report Name
        cy.contains("label", "Report Name").should("be.visible").within(() => {
            cy.get("span.text-red-500").should("contain.text", "*");
        });

        // Verify optional fields are visible
        cy.contains("label", "Start Date").should("be.visible");
        cy.contains("label", "End Date").should("be.visible");
        cy.contains("span", "Select Users").should("be.visible");
        cy.contains("span", "Select Resource Types").should("be.visible");

        // Verify buttons
        cy.contains("button", "Cancel").should("be.visible");
        cy.contains("button span", "Generate").should("be.visible");
    });


    it("Generate reports based on json value passed and if no value passed, it will skip", () => {
        cy.xpath("//button[@title='Generate Report']/span[contains(text(),'Generate Report')]").click();

        // ================================================= Report Name (Required) ======================================================
        if (userData.ReportName) {
            cy.get("input[placeholder='Enter report name']").clear().type(userData.ReportName).should("have.value", userData.ReportName);
        }

        // ======================================================== Start Date ===========================================================
        if (userData.StartDate) {
            cy.get("input[type='date']").eq(0).type(userData.StartDate).should("have.value", userData.StartDate);

            // If Start Date is selected → End date MUST be selected
            if (!userData.EndDate) {
                cy.log("⚠ Start Date selected → End Date is mandatory but not provided in JSON");
                cy.contains("label", "End Date").parent().find("span.text-red-500").should("exist");  // Mandatory (*) indicator
            }
        }

        // ======================================================= End Date =============================================================
        if (userData.EndDate) {
            cy.get("input[type='date']").eq(1).type(userData.EndDate).should("have.value", userData.EndDate);
        }

        // ==================================================== Users Dropdown ===========================================================
        if (userData.Users && userData.Users.filter(u => u.trim() !== "").length > 0) {
            const users = userData.Users.filter(u => u.trim() !== "");   // supports single or multiple

            // 1. Open the dropdown
            cy.contains("label", /^Users$/).parent().find("button").click();
            users.forEach((user) => {
                // 2. Search input
                cy.xpath("//input[@placeholder='Search...']").should("be.visible").clear().type(user);

                // 3. Select the checkbox
                cy.contains("span", new RegExp(`^${user}$`, "i")).parents("label").find("input[type='checkbox']").check({ force: true });
            });
            // 4. Close dropdown using label again (NOT button text)
            cy.contains("label", /^Users$/).parent().find("button").click();
        }

        // Check Visibility of Operation Type drop down
        cy.contains("label", "Operation Types").parent().find("button").should("be.disabled");
        cy.contains("label", "Operation Types").parent().find("button span").should("have.text", "Select resource types first");


        // ============================================= Resource Types Dropdown ===============================================
        if (userData.ResourceTypes && userData.ResourceTypes.filter(r => r.trim() !== "").length > 0) {
            const resources = userData.ResourceTypes.filter(r => r.trim() !== "");   // supports single or multiple

            // 1. Open the dropdown
            cy.contains("label", /^Resource Types$/).parent().find("button").click();

            resources.forEach((resource) => {

                // 2. Type into search box
                cy.xpath("//input[@placeholder='Search...']").should("be.visible").clear().type(resource);

                // 2. Wait for UL to re-render
                cy.get("ul.py-1.max-h-60.overflow-y-auto").should("exist");

                // 3. Find the span inside the UL (scoped search)
                cy.get("ul.py-1.max-h-60.overflow-y-auto").contains("span", new RegExp(`^${resource}$`, "i")).should("be.visible").parents("label").find("input[type='checkbox']").check({ force: true });
            });
            // 4. Close dropdown
            cy.contains("label", /^Resource Types$/).parent().find("button").click();

            // Check Operation Types button is now enabled
            cy.contains("label", "Operation Types").parent().find("button").should("not.be.disabled").and("not.have.class", "cursor-not-allowed");

        }


        // ========================================================== Operation Types Dropdown ====================================================
        if (userData.OperationTypes && userData.OperationTypes.filter(o => o.trim() !== "").length > 0) {

            const operations = userData.OperationTypes.filter(o => o.trim() !== ""); // supports single or multiple

            // 1. Open dropdown via label
            cy.contains("label", /^Operation Types$/).parent().find("button").click();

            operations.forEach((op) => {

                // 2. Search and filter
                cy.xpath("//input[@placeholder='Search...']").should("be.visible").clear().type(op);

                // 3. Select checkbox
                cy.contains("span", new RegExp(`^${op}$`, "i")).parents("label").find("input[type='checkbox']").check({ force: true });
            });

            // 4. Close dropdown
            cy.contains("label", /^Operation Types$/).parent().find("button").click();
        }

        // ======================================== Click Generate =======================================
        // Click Generate
        cy.get("div.flex.items-center.justify-end button").contains("Generate").click();

        // Verify toast
        cy.contains("button", "Generate").click({ force: true });
        cy.wait(500);

        // Success or Failure toast
        cy.get("body").then(($body) => {

            // ---------- SUCCESS BLOCK ----------
            if ($body.text().includes("Report generation started successfully!")) {
                cy.contains("div", "Report generation started successfully!", { timeout: 20000 }).should("be.visible");

                cy.log("✅ Report created successfully");

                // Refresh table
                cy.get('button[title="Refresh"]').click({ force: true });

                // Validate first table row
                cy.get("table tbody tr").first().within(() => {
                    cy.get("td").eq(2).should("have.text", userData.ReportName);
                    cy.get("button[title='Download Report']").click({ force: true });
                });
                // Verify download success toast
                cy.contains("div", "Report downloaded successfully", { timeout: 20000 }).should("be.visible");

                // ---------- FAILURE BLOCK ----------
            } else if ($body.text().includes("Failed to create report record")) {
                cy.contains("div", "Failed to create report record").should("be.visible");
                cy.log("⚠ Report name already exists — expected behaviour and Enter Unique Report name");
            } else {
                throw new Error("⚠ Neither success nor error message appeared!");
            }
        });



    });
});


