/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login

// Test: Database Details Page - Verify UI
describe("Edit table and column Descriptions -> DC_10", () => {
    let userData;

    // 🔹 Load test data from fixture before running tests
    before(() => {
        cy.fixture("DataCatalogue/Table_Details.json").then((data) => {
            userData = data;
        });
    });

    // 🔹 Log in and navigate to the Data Catalogue before each test
    beforeEach(() => {
        // fresh login for every test
        cy.loginAs(userData.Role);
        cy.wait(500);

        // Always navigate to Business Catalogue page
        cy.contains("button", "Data Governance").click();
        cy.xpath("(//button[contains(@class, 'p-1')])[2]").click();
        cy.xpath("//a[@href='/datagovernance/data-catalogue/table']").click();
        cy.url().should("match", /\/datagovernance\/data-catalogue\/Table/i);
        cy.wait(5000);
    });


    it("Validates role-based edit permissions for Table description", () => {
        cy.log(`Searching for Table: "${userData.Searchvalue}"`);

        cy.xpath("//input[@placeholder='Search Tables']")
            .should("be.visible")
            .clear()
            .type(userData.Searchvalue);

        cy.contains("td", userData.Searchvalue, { timeout: 10000 })
            .should("be.visible")
            .click();

        // ====== 🔹 Role-based visibility and editing ======
        cy.log(`🔹 Current Role: ${userData.Role}`);

        // Normalize the role to lowercase so comparison ignores capitalization
        const role = userData.Role.trim().toLowerCase();

        if (role === "datasteward") {
            cy.log("Role = Data Steward: Should edit and update immediately");

            // --- Edit Table Description ---
            cy.xpath("//button[@title='Edit Table Description']").should("be.visible").click();
            cy.get("textarea.w-full.p-2.border.border-gray-300.rounded-md").should("be.visible").clear().type(userData.New_Table_Description);
            cy.xpath("//button[text() = 'Save']").click();
            cy.xpath("//div[text()='Table description updated successfully.']").should("be.visible");
            cy.log("✅ Table description updated by Data Steward");

            // --- Edit Column Description ---
            cy.xpath("//button[@title='Edit Column Description']").first().should("be.visible").click();
            cy.get("input.w-full.p-2.border.border-gray-300.rounded-md").should("be.visible").clear().type(userData.New_Column_Description)
            cy.xpath("//button[@title='Save']").click();
            cy.xpath("//div[text()='Column description updated successfully.']").should("be.visible");
            cy.log("✅ Column description updated by Data Steward");

        }

        else if (role === "dataowner") {
            cy.log("🟡 Role = Data Owner: Should edit, but request goes to Data Steward");

            cy.wait(500);

            // --- Edit Schema Description ---
            cy.xpath("//button[@title='Edit Table Description']").should("be.visible").click();
            cy.get("textarea.w-full.p-2.border.border-gray-300.rounded-md").should("be.visible").clear().type(userData.New_Table_Description);
            cy.xpath("//button[text() = 'Save']").click();


            // --- Wait for either success or already-pending message ---
            cy.xpath("//div[contains(text(),'Request sent') or contains(text(),'Another description entry is already awaiting approval')]",
                { timeout: 15000 }
            ).should("be.visible").then(($msg) => {
                const messageText = $msg.text().trim();
                cy.log(`🟡 Table message shown: "${messageText}"`);

                if (messageText.includes("Request sent")) {
                    cy.log("✅ Table change request sent successfully.");
                } else if (messageText.includes("awaiting approval")) {
                    cy.log("⚠️ Another Table request already awaiting approval.");
                }
            });

            cy.wait(1000);

                        // --- Edit Column Description ---
            cy.xpath("//button[@title='Edit Column Description']").first().should("be.visible").click();
            cy.get("input.w-full.p-2.border.border-gray-300.rounded-md").should("be.visible").clear().type(userData.New_Column_Description)
            cy.xpath("//button[@title='Save']").click();


            // --- Wait for either success or already-pending message ---
            cy.xpath("//div[contains(text(),'Request sent') or contains(text(),'Another description entry is already awaiting approval')]",
                { timeout: 15000 }
            ).should("be.visible").then(($msg) => {
                const messageText = $msg.text().trim();
                cy.log(`🟡 Table message shown: "${messageText}"`);

                if (messageText.includes("Request sent")) {
                    cy.log("✅ Column change request sent successfully.");
                } else if (messageText.includes("awaiting approval")) {
                    cy.log("⚠️ Another Column request already awaiting approval.");
                }
            });

        }

        else {
            cy.log("🚫 Role = Other: Edit buttons should not be visible");
            cy.xpath("//button[@title='Edit Column Description']").should("not.exist");
        }

    });
});
