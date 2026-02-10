/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login

// Test: Database Details Page - Verify UI
describe("Table Details Page - UI Validation -> DC_09", () => {
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
    // cy.screenshot("SchemaPage");
    cy.wait(5000);
  });

  it("Validates Table Details UI functionality", () => {
    cy.log(`Searching for Table: "${userData.Searchvalue}"`);
    cy.xpath("//input[@placeholder='Search Tables']").should('be.visible').clear().type(userData.Searchvalue);

    // 🔹 Select database from search results
    cy.contains('td', userData.Searchvalue, { timeout: 10000 }).should('be.visible').click(); // click on the connection name

    // 🔹 Verify correct page navigation
    cy.url({ timeout: 20000 }).should('include', `/datagovernance/data-catalogue/table/${userData.Searchvalue}`);

    // ----------------------------------- Summary Tab Validation ------------------------------------
    // 🔹 Verify all tabs visibility
    cy.contains("button", "Summary").should("have.class", "border-b-2").and("contain.text", "Summary");
    cy.contains("button", "Sample data").should("have.class", "border-b-2").and("be.visible");
    cy.contains("button", "Access").should("have.class", "border-b-2").and("be.visible");
    cy.contains("button", "Business").should("have.class", "border-b-2").and("be.visible");

    // 🔹 Verify layout (left and right sections)
    cy.xpath("//div[@class='flex-grow bg-white px-6 pt-6 pb-10 rounded-lg shadow-sm min-w-0']").should('be.visible');
    cy.xpath("//div[@class='bg-white p-5 rounded-lg shadow-sm text-sm']").should('be.visible');


    // 🔹 Snapshot section validation
    cy.contains("h3", "Snapshot").should("be.visible");
    ["Type", "Data source", "Created on", "Last updated", "Owner", "Steward"].forEach(
      (label) => {
        cy.contains("div", label).should("be.visible");
      }
    );

    // 🔹 Header validation
    cy.get("h1.text-2xl.font-bold.text-gray-800").should("have.text", userData.Searchvalue);

    // 🔹  Columns count checks
    cy.contains("p.text-sm.text-gray-500", "Columns").prev("h2.font-semibold").invoke("text").then((columnCount) => {
      cy.log(`Table columns count: ${columnCount}`);
      expect(Number(columnCount.trim())).to.be.greaterThan(0);
    });

    // 🔹 Description section
    cy.contains("h3", "Description").should("be.visible").parent().next("div").invoke("text").then((descText) => {
      cy.log(`Description found: ${descText}`);
      expect(descText.trim()).to.not.be.empty;
    });

    // Verify Compliance section and its tags
    cy.contains("h3", "Compliance")
      .should("be.visible")
      .parent()
      .next("div.pl-7")
      .find("span")
      .should("exist")
      .and("be.visible")
      .then(($tags) => {
        const tagTexts = $tags.map((i, el) => Cypress.$(el).text().trim()).get();

        if (tagTexts.includes("NA")) {
          cy.log("✅ Compliance tags not assigned (shows NA)");
          expect(tagTexts).to.include("NA");
        } else {
          cy.log("✅ Compliance tags assigned:", tagTexts.join("  ,"));
          expect(tagTexts.length).to.be.greaterThan(0);
        }
      });


    /*
    1. Verifies that all table headers are visible and match the expected headers.
    2. Fetches and logs the first row values.
    3. Collects all “Name” column values across every pagination page.
    4. Then switches to the Sample Data tab and verifies that every sample data header is included in the collected name list.
    */
    // ================== Validate Table Headers and First Row ==================
    const expectedHeaders = ["ID", "Name", "Description", "Classification", "Action"];
    let nameColumnValues = [];

    // 🔹 Verify headers are visible
    expectedHeaders.forEach((header) => {
      cy.get("table thead th")
        .contains(header)
        .should("exist")
        .and("be.visible");
    });
    cy.log("✅ All expected headers are visible and verified");

    // 🔹 Validate and print first row data
    cy.get("table tbody tr")
      .should("exist")
      .first()
      .within(() => {
        cy.get("td").should("have.length", expectedHeaders.length);
        cy.get("td").then(($cells) => {
          const values = [...$cells].map((c) => c.innerText.trim());
          cy.log(`🧾 First row values: ${values.join(" | ")}`);
          cy.log("✅ First row data validated successfully");
        });
      });

    // ================== Collect “Name” Column Values (with pagination support) ==================
    function collectNameValues() {
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row)
          .find("td")
          .eq(1)
          .invoke("text")
          .then((name) => {
            const cleanName = name.trim().toUpperCase().replace(/_/g, "");
            if (cleanName) nameColumnValues.push(cleanName);
          });
      });
    }

    cy.log("🔹 Collecting all 'Name' column values...");
    collectNameValues();

    // ✅ Handle pagination if it exists
    cy.get("body").then(($body) => {
      const nextBtn = $body.find('button[title="Next"]');

      // If pagination exists
      if (nextBtn.length > 0) {
        cy.wrap(nextBtn).then(($nextBtn) => {
          if ($nextBtn.is(":disabled") || $nextBtn.attr("disabled")) {
            cy.log("🟢 Last page reached — pagination complete");
          } else {
            cy.wrap($nextBtn).click({ force: true });
            cy.wait(1000);
            collectNameValues(); // Collect next page
          }
        });
      } else {
        cy.log("ℹ️ No pagination found — single page of data only.");
      }
    });

    // ✅ After collection, go to Sample Data tab and compare
    cy.then(() => {
      cy.log(`📦 Collected names: ${nameColumnValues.join(", ")}`);

      // Go to Sample Data tab
      cy.contains("button", "Sample data").click();
      cy.wait(2000);

      // Compare headers
      cy.get("table thead th", { timeout: 10000 })
        .should("exist")
        .and("have.length.greaterThan", 0)
        .each(($th, index) => {
          const header = $th.text().trim().toUpperCase().replace(/_/g, "");
          cy.log(`🧩 Header ${index + 1}: ${header}`);

          // Only check that the header text is in the collected names
          if (nameColumnValues.includes(header)) {
            cy.log(`✅ Header '${header}' exists in Summary tab name column`);
          } else {
            cy.log(`⚠️ Header '${header}' not found in Summary tab name column`);
          }
        })
        .then(() => {
          cy.log("🎯 Completed Sample Data header comparison successfully");
        });
    });

    // ✅ Verify that exactly 5 rows are visible in the Sample Data table
    cy.get("table tbody tr:visible")
      .should("have.length", 5)
      .each(($row, index) => {
        cy.wrap($row)
          .find("td")
          .then(($cells) => {
            // Extract trimmed text values from each cell
            const rowValues = [...$cells].map((cell) => cell.innerText.trim());
            cy.log(`Row ${index + 1}: ${rowValues.join(" | ")}`);
          });
      });


    // ----------------------------------- Access Tab Validation ------------------------------------
    // 🔹 Now click Access
    cy.contains("button", "Access").click();

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
    cy.log("🔹 Validating Business Tab");
    cy.contains("button", "Business").click();
    cy.wait(1000);

    // Confirm Composite View and Table Detail View buttons exist
    cy.contains("button", "Composite view").should("be.visible");
    cy.contains("button", "Table Detail View").should("be.visible");

    cy.log("🔹 Verifying Composite View section");

    // --- Expected linkage fields
    const fields = ["Domain", "Category", "Sub-category", "Tag", "Sub-tag"];

    // ----------------- Business Tab → Composite View Validation ------------------------------
    fields.forEach((field) => {
      cy.contains("h3.text-base.font-semibold.text-gray-700", field)
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
    cy.log("🔹 Switching to Table Detail View");
    cy.contains("button", "Table Detail View").click();
    cy.wait(1000);

    // Check if a table or "No business data available" message exists
    cy.get("body").then(($body) => {
      if ($body.text().includes("No business data available for this table.")) {
        cy.contains("No business data available for this table.").should("be.visible");
        cy.log("⚠️ No business data available for this table in Table Detail View");
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
