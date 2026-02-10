/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login 
// and navigation to the Business Catalogue page.

describe("Business Catalogue - Role Based Visibility -> BC_01", () => {


    // Reusable navigation after login
    const navigateToBusinessCatalogue = () => {
        cy.contains("button", "Data Governance").click();
        cy.xpath("//a[@href='/datagovernance/business-catalogue']").click();
    };

    // ============================ Test Case 1: Admin (assumed highest privileges) ===================================
    it("1. Admin should see + Add and 3 dots menu", () => {
        // 1. Admin (Full Access User) should see Add button and Actions menu
        cy.loginAs("adminUser");
        navigateToBusinessCatalogue();

        cy.contains("button", "Add").should("exist").and("be.visible"); // Assert that the creation buttons exist
        cy.get("button[title='See Actions']")
            .first()
            .scrollIntoView({ offset: { top: -200 } })
            .should("be.visible");
    });

    // =================================== Test Case 2: Data Owner permissions =======================================
    it("2. Data Owner (Request-Based Permissions) should see Add button and Actions menu", () => {
        cy.loginAs("dataOwner");
        navigateToBusinessCatalogue();

        cy.contains("button", "Add").should("exist").and("be.visible"); // Assert that the creation buttons exist
        cy.get("button[title='See Actions']")
            .first()
            .scrollIntoView({ offset: { top: -200 } })
            .should("be.visible");
    });

    // =================================== Test Case 3: Data Steward permissions ======================================
    it("3. Data Steward (Direct Modify Access) should see Add button and Actions menu", () => {
        cy.loginAs("dataSteward");
        navigateToBusinessCatalogue();

        cy.contains("button", "Add").should("exist").and("be.visible");  // Assert that the creation buttons exist
        cy.get("button[title='See Actions']")
            .first()
            .scrollIntoView({ offset: { top: -200 } })
            .should("be.visible");
    });

    // =================================== Test Case 4: Regular User permissions (Negative Test) =========================
    it("4. Regular User (View-Only Access) should NOT see Add button or Actions menu", () => {
        cy.loginAs("regularUser");
        navigateToBusinessCatalogue();

        cy.contains("button", "Add").should("not.exist"); // Assert that the 'Add' button does NOT exist
        cy.get("button[title='See Actions']").should("not.exist");
    });

});


