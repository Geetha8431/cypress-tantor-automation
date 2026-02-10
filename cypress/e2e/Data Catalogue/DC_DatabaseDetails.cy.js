/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login

// Test: Database Details Page - Verify UI, Edit Database & Schema Descriptions
describe("Database Details Page - UI and Description Editing -> DC_03", () => {
  let userData;

  // 🔹 Load test data from fixture before running tests
  before(() => {
    cy.fixture("DataCatalogue/Database_ConnDetails.json").then((data) => {
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
    cy.xpath("//a[@href='/datagovernance/data-catalogue/database']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/database/i);
    // cy.screenshot("DatabasePage");
    cy.wait(5000);
  });

  it("Validates Database Details Page", () => {
    // 🔹 Switch to list view and search for a database
    cy.xpath("//button[@title='List View']").should('be.visible').click();

    cy.log(`Searching for connection: "${userData.Searchvalue}"`);
    cy.xpath("//input[@placeholder='Search connections...']").should('be.visible').clear().type(userData.Searchvalue);

    // 🔹 Select database from search results
    cy.contains('td', userData.Searchvalue, { timeout: 10000 }).should('be.visible').click(); // click on the connection name

    // 🔹 Verify correct page navigation
    cy.url({ timeout: 20000 }).should('include', `/datagovernance/data-catalogue/database/${userData.Searchvalue}`);
    cy.wait(5000);

    // 🔹 Verify layout (left and right sections)
    cy.xpath("//div[@class='bg-white w-[70%] h-full p-5']").should('be.visible');
    cy.xpath("//div[@class='bg-white w-[30%] p-5 text-sm']").should('be.visible');

    // 🔹 Header validation
    cy.get("h1.font-medium.text-xl").should("have.text", userData.Searchvalue);

    // 🔹 Schema & Table count checks
    cy.contains("div.text-gray-500", "Schema").prev("span.font-medium").invoke("text").then((schemaCount) => {
      cy.log(`Schema count: ${schemaCount}`);
      expect(Number(schemaCount.trim())).to.be.greaterThan(0);
    });
    cy.contains("div.text-gray-500", "Tables").prev("span.font-medium").invoke("text").then((tableCount) => {
      cy.log(`Tables count: ${tableCount}`);
      expect(Number.isNaN(Number(tableCount.trim()))).to.be.false;
    });

    // 🔹 Summary tab active and Access tab inactive
    cy.contains("button", "Summary").should("have.class", "border-b-2").and("contain.text", "Summary");
    cy.contains("button", "Access").should("not.have.class", "border-b-2").and("be.visible");

    // 🔹 Now click Access
    cy.contains("button", "Access").click();

    // 🔹 Summary tab inactive and Access tab active
    cy.contains("button", "Access").should("have.class", "border-b-2");
    cy.contains("button", "Summary").should("not.have.class", "border-b-2").and("be.visible");

    // 🔹 Verify Access section visible
    cy.contains("Type").should("be.visible");
    cy.contains("Name").should("be.visible");
    cy.contains("User Count").should("be.visible");

    // 🔹Verify Access tab
    cy.xpath("//table[@class='min-w-full']").should("be.visible");

    // ✅ Check if Access tab table exists before looking for rows
    cy.get("body").then(($body) => {
      if ($body.find("table.min-w-full").length === 0) {
        cy.log("⚠️ Access tab table not found — skipping checks.");
        return;
      }

      // Now safely check for rows inside the table
      const $table = $body.find("table.min-w-full");
      const $rows = $table.find("tbody tr");

      if ($rows.length === 0) {
        cy.log("⚠️ No roles or user data found in Access tab — skipping checks.");
        return;
      }

      cy.log(`✅ Found ${$rows.length} rows in Access table. Proceeding with validation...`);

      // Iterate through the rows
      cy.wrap($rows).each(($row) => {
        cy.wrap($row)
          .find("td")
          .eq(1)
          .invoke("text")
          .then((typeText) => {
            if (typeText.trim() === "Role") {
              // Extract role name
              cy.wrap($row)
                .find("td")
                .eq(2)
                .invoke("text")
                .then((roleName) => cy.log(`📘 Role: ${roleName.trim()}`));

              // Get expected user count
              cy.wrap($row)
                .find("td")
                .eq(3)
                .invoke("text")
                .then((userCountText) => {
                  const expectedCount = parseInt(userCountText.trim());
                  cy.log(`👥 Expected user count: ${expectedCount}`);

                  if (isNaN(expectedCount) || expectedCount === 0) {
                    cy.log("⚠️ Skipping: No users found for this role.");
                    return;
                  }

                  // Expand and check next sibling row
                  cy.wrap($row).find("button").click({ force: true });

                  cy.wrap($row)
                    .next()
                    .should("exist")
                    .within(() => {
                      cy.get("h4").should("contain.text", "Users:");
                      cy.get("span.bg-purple-100").then(($users) => {
                        const actualCount = $users.length;
                        cy.log(`✅ Actual users displayed: ${actualCount}`);
                        expect(actualCount).to.equal(expectedCount);
                      });
                    });
                });
            }
          });
      });
    });



  // 🔹Navigate to Summary tab
  cy.contains("button", "Summary").click();

  // 🔹 Description section
  cy.contains("h3", "Description").should("be.visible");
  cy.get("div.text-gray-500.pt-5 p.text-gray-600").invoke("text").then((descText) => {
    cy.log(`Description found: ${descText}`);
    expect(descText.trim()).to.not.be.empty;
  });

  // 🔹 Schema Table headers
  cy.get("table").within(() => {
    ["Id", "Schema Name", "Schema Description", "Action"].forEach((header) => {
      cy.contains("th", header).should("be.visible");
    });
  });

  // 🔹 Snapshot section validation
  cy.contains("h3", "Snapshot").should("be.visible");
  ["Data Source", "Created on", "Last updated", "Owner", "Steward"].forEach(
    (label) => {
      cy.contains("div", label).should("be.visible");
    }
  );

});


  });
