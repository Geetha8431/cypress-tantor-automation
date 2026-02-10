/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login

// Test: Database Details Page - Verify UI
describe("Schema Details Page - UI Validation -> DC_06 ", () => {
  let userData;

  // 🔹 Load test data from fixture before running tests
  before(() => {
    cy.fixture("DataCatalogue/Schema_Details.json").then((data) => {
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
    cy.xpath("//a[@href='/datagovernance/data-catalogue/schema']").click();
    cy.url().should("match", /\/datagovernance\/data-catalogue\/Schema/i);
    // cy.screenshot("SchemaPage");
    cy.wait(5000);
  });

  it("Validates Schema Details UI functionality", () => {
    cy.log(`Searching for Schema: "${userData.Searchvalue}"`);
    cy.xpath("//input[@placeholder='Search schema ...']").should('be.visible').clear().type(userData.Searchvalue);

    // 🔹 Select database from search results
    cy.contains('td', userData.Searchvalue, { timeout: 10000 }).should('be.visible').click(); // click on the connection name

    // 🔹 Verify correct page navigation
    cy.url({ timeout: 20000 }).should('include', `/datagovernance/data-catalogue/schema/${userData.Searchvalue}`);


    // ----------------------------------- Summary Tab Validation ------------------------------------
    // 🔹 Summary tab active and Access tab inactive
    cy.contains("button", "Summary").should("have.class", "border-b-2").and("contain.text", "Summary");
    cy.contains("button", "Access").should("not.have.class", "border-b-2").and("be.visible");
    cy.contains("button", "Business").should("not.have.class", "border-b-2").and("be.visible");

    // 🔹 Verify layout (left and right sections)
    cy.xpath("//div[@class='bg-white w-[70%] h-full p-5']").should('be.visible');
    cy.xpath("//div[@class='bg-white w-[30%] p-5 text-sm']").should('be.visible');

    // 🔹 Header validation
    cy.get("h1.font-medium.text-xl").should("have.text", userData.Searchvalue);

    // 🔹 Tables and Columns count checks
    cy.contains("div.text-gray-500", "Tables").prev("span.font-medium").invoke("text").then((tableCount) => {
      cy.log(`Schema tables count: ${tableCount}`);
      expect(Number.isNaN(Number(tableCount.trim()))).to.be.false;
    });
    cy.contains("div.text-gray-500", "Columns").prev("span.font-medium").invoke("text").then((columnCount) => {
      cy.log(`Schema columns count: ${columnCount}`);
      expect(Number(columnCount.trim())).to.be.greaterThan(0);
    });

    // 🔹 Description section
    cy.contains("h3", "Description").should("be.visible");
    cy.get("div.text-gray-500.pt-5 p.text-gray-600").invoke("text").then((descText) => {
      cy.log(`Description found: ${descText}`);
      expect(descText.trim()).to.not.be.empty;
    });

    // Verify Compliance section and its tags
    cy.contains("span", "Compliance")
      .should("be.visible")
      .parents(".pt-12") // <-- go to the full Compliance block container
      .within(() => {
        cy.get("div.flex.gap-3.pt-4.text-sm span") // this matches the tags section
          .should("exist") // check it exists first
          .and("be.visible")
          .then(($tags) => {
            const tagTexts = $tags.map((i, el) => Cypress.$(el).text().trim()).get();

            if (tagTexts.includes("NA")) {
              cy.log("✅ Compliance tags not assigned (shows NA)");
              expect(tagTexts).to.include("NA");
            } else {
              cy.log("✅ Compliance tags assigned:", tagTexts.join(", "));
              expect(tagTexts.length).to.be.greaterThan(0);
            }
          });
      });

    // 🔹 Snapshot section validation
    cy.contains("h3", "Snapshot").should("be.visible");
    ["Connection", "Database", "Created on", "Last updated", "Owner", "Steward"].forEach(
      (label) => {
        cy.contains("div", label).should("be.visible");
      }
    );

    // ----------------------------------- Accsess Tab Validation ------------------------------------
    // 🔹 Now click Access
    cy.contains("button", "Access").click();

    // 🔹 Summary tab inactive and Access tab active
    cy.contains("button", "Access").should("have.class", "border-b-2");
    cy.contains("button", "Summary").should("not.have.class", "border-b-2").and("be.visible");
    cy.contains("button", "Business").should("not.have.class", "border-b-2").and("be.visible");

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

    // ----------------------------------- Business Tab Validation ------------------------------------
    // 🔹 Now click Business
    cy.contains("button", "Business").click();

    // 🔹 Summary tab inactive and Access tab active
    cy.contains("button", "Business").should("have.class", "border-b-2");
    cy.contains("button", "Summary").should("not.have.class", "border-b-2").and("be.visible");
    cy.contains("button", "Access").should("not.have.class", "border-b-2").and("be.visible");

    cy.wait(1000);

    // Confirm Composite View is active
    cy.contains("button", "Composite view").should("have.class", "border-b-2").and("be.visible");
    cy.contains("button", "Schema detail View").should("not.have.class", "border-b-2").and("be.visible");

    // --- Declare sections here (fixes the ReferenceError) ---
        // --- Expected linkage fields
        const fields = ["Domain", "Category", "Sub-category", "Tag", "Sub-tag"];

        // ----------------- Business Tab → Composite View Validation ------------------------------
        fields.forEach((field) => {
            cy.contains("div.font-medium", field)
                .should("be.visible")
                .next("div")
                .find("span")
                .should("be.visible")
                .invoke("text")
                .then((valueText) => {
                    const value = valueText.trim();
                    cy.log(`🧩 ${field}: ${value}`);

                    if (value === "N/A" || value === "NA") {
                        cy.log(`🟡 ${field} not assigned (shows N/A)`);
                    } else {
                        cy.log(`✅ ${field} value found: ${value}`);
                    }
                });
        });

        // ------------------------- Switch to Table Detail View -------------------------
        cy.log("🔹 Switching to schema Detail View");
        cy.contains("button", "Schema detail View").click();
        cy.wait(1000);

        // Check if a table or "No business data available" message exists
        cy.get("body").then(($body) => {
            if ($body.text().includes("No business data available for this schema.")) {
                cy.contains("No business data available for this schema.").should("be.visible");
                cy.log("⚠️ No business data available for this schema in schema Detail View");
            } else if ($body.find("table.min-w-full").length > 0) {
                cy.log("✅ Business data table found — verifying contents...");

                cy.get("table.min-w-full tbody tr").each(($row, index) => {
                    cy.wrap($row)
                        .find("td")
                        .then(($tds) => {
                            const label = $tds.eq(0).text().trim();
                            const value = $tds.eq(1).text().trim();
                            cy.log(`🧾 Row ${index + 1} → ${label}: ${value}`);
                        });
                });
            } else {
                throw new Error("❌ Neither table nor 'No business data available' message found in Table Detail View");
            }
        });

  });


});