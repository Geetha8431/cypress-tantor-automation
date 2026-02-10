/// <reference types="cypress" />

describe("Database Details Page - Role Based Edit Description Validation -> DC_07", () => {
    let userData;

    before(() => {
        cy.fixture("DataCatalogue/Schema_Details.json").then((data) => {
            userData = data;
        });
    });

    beforeEach(() => {
        cy.loginAs(userData.Role);
        cy.wait(1000);

        // Navigate to Data Catalogue page
        cy.contains("button", "Data Governance").click();
        cy.xpath("(//button[contains(@class, 'p-1')])[2]").click();
        cy.xpath("//a[@href='/datagovernance/data-catalogue/schema']").click();
        cy.url().should("match", /\/datagovernance\/data-catalogue\/Schema/i);
    });



    it("Validates role-based edit permissions for Schema description", () => {
        cy.log(`Searching for connection: "${userData.Searchvalue}"`);

        cy.xpath("//input[@placeholder='Search schema ...']")
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

            // --- Edit Schema Description ---
            cy.xpath("//button[@title='Edit Schema Description']").should("be.visible").click();
            cy.get("textarea.w-full.p-3.border.border-gray-300.rounded-md")
                .should("be.visible")
                .clear()
                .type(userData.New_Schema_Description);
            cy.xpath("//button[text() = 'Save']").click();
            cy.xpath("//div[text()='Schema description updated successfully.']").should("be.visible");
            cy.log("✅ Schema description updated by Data Steward");
        }

        else if (role === "dataowner") {
            cy.log("🟡 Role = Data Owner: Should edit, but request goes to Data Steward");

            cy.wait(500);

            // --- Edit Schema Description ---
            cy.xpath("//button[@title='Edit Schema Description']").should("be.visible").click();
            cy.get("textarea.w-full.p-3.border.border-gray-300.rounded-md")
                .should("be.visible")
                .clear()
                .type(userData.New_Schema_Description);
            cy.xpath("//button[text() = 'Save']").click();


            // --- Wait for either success or already-pending message ---
            cy.xpath(
                "//div[contains(text(),'Request sent') or contains(text(),'Another description entry is already awaiting approval')]",
                { timeout: 15000 }
            )
                .should("be.visible")
                .then(($msg) => {
                    const messageText = $msg.text().trim();
                    cy.log(`🟡 Schema message shown: "${messageText}"`);

                    if (messageText.includes("Request sent")) {
                        cy.log("✅ Schema change request sent successfully.");
                    } else if (messageText.includes("awaiting approval")) {
                        cy.log("⚠️ Another schema request already awaiting approval.");
                    }
                });
        }

        else {
            cy.log("🚫 Role = Other: Edit buttons should not be visible");
            cy.xpath("//button[@title='Edit Schema Description']").should("not.exist");
        }

    });
});
