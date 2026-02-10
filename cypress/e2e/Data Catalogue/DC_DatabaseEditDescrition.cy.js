/// <reference types="cypress" />

describe("Database Details Page - Role Based Edit Description Validation -> DC_04", () => {
  let userData;

  before(() => {
    cy.fixture("DataCatalogue/Database_ConnDetails.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    cy.loginAs(userData.Role);
    cy.wait(1000);

    // Navigate to Data Catalogue page
    cy.contains("button", "Data Governance").click();
    cy.xpath("(//button[contains(@class, 'p-1')])[2]").click();
    cy.xpath("//a[@href='/datagovernance/data-catalogue/database']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/database/i);
  });



  it("Validates role-based edit permissions for DB and Schema descriptions", () => {
    cy.xpath("//button[@title='List View']").should("be.visible").click();
    cy.log(`Searching for connection: "${userData.Searchvalue}"`);

    cy.xpath("//input[@placeholder='Search connections...']")
      .should("be.visible")
      .clear()
      .type(userData.Searchvalue);

    cy.contains("td", userData.Searchvalue, { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.url({ timeout: 20000 }).should("include", `/datagovernance/data-catalogue/database/${userData.Searchvalue}`);

    cy.wait(5000);

    // ====== 🔹 Role-based visibility and editing ======
    cy.log(`🔹 Current Role: ${userData.Role}`);

    // Normalize the role to lowercase so comparison ignores capitalization
    const role = userData.Role.trim().toLowerCase();

    if (role === "datasteward") {
      cy.log("Role = Data Steward: Should edit and update immediately");

      // --- Edit Database Description ---
      cy.xpath("//button[@title='Edit Connection Description']").should("be.visible").click();
      cy.xpath("//textarea").clear().type(userData.New_DB_Description);
      cy.xpath("//button[contains(text(), 'Save')]").click();
      cy.xpath("//div[text()='Connection description updated successfully.']").should("be.visible");
      cy.log("✅ Database description updated by Data Steward");

      // --- Edit Schema Description ---
      cy.xpath("//button[@title='Edit Schema Description']").should("be.visible").click();
      cy.get("input.w-full.p-2.border.border-gray-300.rounded-md")
        .should("be.visible")
        .clear()
        .type(userData.New_Schema_Description);
      cy.xpath("//button[@title='Save']").click();
      cy.xpath("//div[text()='Schema description updated successfully.']").should("be.visible");
      cy.log("✅ Schema description updated with new");
    }

    else if (role === "dataowner") {
      cy.log("🟡 Role = Data Owner: Should edit, but request goes to Data Steward");

      // --- Edit Database Description ---
      cy.xpath("//button[@title='Edit Connection Description']").should("be.visible").click();
      cy.xpath("//textarea").clear().type(userData.New_DB_Description);
      cy.xpath("//button[contains(text(), 'Save')]").click();

      // ✅ Handle both possible messages for DB Description
      cy.xpath("//div[contains(text(),'Request sent to Data Steward for approval.') or contains(text(),'Another description entry is already awaiting approval.')]")
        .should("be.visible")
        .then(($msg) => {
          const messageText = $msg.text().trim();
          cy.log(`🟡 Message shown: "${messageText}"`);

          if (messageText.includes("Request sent")) {
            cy.log("✅ Schema change request sent successfully.");
          } else if (messageText.includes("awaiting approval")) {
            cy.log("⚠️ Another schema request already awaiting approval.");
          }
        });

      cy.wait(500);

      // --- Edit Schema Description ---
      cy.xpath("//button[@title='Edit Schema Description']").should("be.visible").click();
      cy.get("input.w-full.p-2.border.border-gray-300.rounded-md")
        .should("be.visible")
        .clear()
        .type(userData.New_Schema_Description);
      cy.xpath("//button[@title='Save']").click();


      // Handle both possible messages for Schema Description
      cy.xpath("//div[contains(text(),'Request sent') or contains(text(),'Another description entry is already awaiting approval.')]")
        .should("be.visible")
        .then(($msg) => {
          const messageText = $msg.text().trim();
          cy.log(`🟡 Schema message shown: "${messageText}"`);

          if (messageText.includes("Schema change request sent")) {
            cy.log("✅ Schema change request sent successfully.");
          } else if (messageText.includes("awaiting approval")) {
            cy.log("⚠️ Schema request already awaiting approval.");
          }
        });
    }

    else {
      cy.log("🚫 Role = Other: Edit buttons should not be visible");
      cy.xpath("//button[@title='Edit Connection Description']").should("not.exist");
      cy.xpath("//button[@title='Edit Schema Description']").should("not.exist");
    }

  });
});
