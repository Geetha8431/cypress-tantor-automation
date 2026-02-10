/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login

// Test: Database Details Page - Verify UI
describe("Column Details Page - UI Validation -> DC_14", () => {
    let userData;

    // 🔹 Load test data from fixture before running tests
    before(() => {
        cy.fixture("DataCatalogue/Column_Details.json").then((data) => {
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
        cy.xpath("//a[@href='/datagovernance/data-catalogue/column']").click();
        cy.url().should("match", /\/datagovernance\/data-catalogue\/Column/i);
    });

    it("Validates Column Details UI functionality", () => {
        cy.log(`Searching for Column: "${userData.Searchvalue}"`);
        cy.xpath("//input[@placeholder='Search by Column Name']").should('be.visible').clear().type(userData.Searchvalue);

        // 🔹 Select database from search results
        cy.contains('td', userData.Searchvalue, { timeout: 10000 }).should('be.visible').click(); // click on the connection name

        // 🔹 Verify correct page navigation
        cy.url({ timeout: 20000 }).should('include', `/datagovernance/data-catalogue/column/${userData.Searchvalue}`);

        cy.wait(4000);

        // ----------------------------------- Summary Tab Validation ------------------------------------
        // 🔹 Verify all tabs visibility
        cy.contains("button", "Summary").should("exist").should("be.visible");
        cy.contains("button", "Sample data").should("exist").should("be.visible");
        cy.contains("button", "Access").should("exist").should("be.visible");
        cy.contains("button", "Business").should("exist").should("be.visible");

        // 🔹 Verify layout (left and right sections)
        cy.xpath("//div[@class='flex-grow bg-white px-6 pt-6 pb-10 rounded-lg shadow-sm min-w-0']").should('be.visible');
        cy.xpath("//div[@class='bg-white p-5 rounded-lg shadow-sm text-sm']").should('be.visible');


        // 🔹 Snapshot section validation
        cy.contains("h3", "Snapshot")
            .closest("div.bg-white") // scope to the specific Snapshot container
            .within(() => {
                [
                    "Data Type",
                    "Data source",
                    "Created on",
                    "Last updated",
                    "Owner",
                    "Steward"
                ].forEach((label) => {
                    cy.contains("div.text-gray-500", label).should("be.visible");
                });
            });


        // 🔹 Header validation
        cy.get("h1.text-xl.font-bold.text-gray-800").should("have.text", userData.Searchvalue);

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



        // ============================== Sample Data Tab Validation ================================
        cy.log("🔹 Verifying Sample Data Section");
        cy.contains("button", "Sample data").click();
        cy.wait(2000);

        // 1️⃣ Check if the table OR error message exists
        cy.get("body").then(($body) => {
            if ($body.find("table.min-w-full").length) {
                cy.get("table.min-w-full").should("exist").should("be.visible");
                cy.log("✅ Sample Data table is visible — proceeding with verification");

                // 2️⃣ Verify the table header with main header
                cy.get("table thead tr th")
                    .invoke("text")
                    .then((headerText) => {
                        const actual = headerText.trim().toLowerCase().replace(/_/g, " ");
                        const expected = userData.Searchvalue.trim().toLowerCase().replace(/_/g, " "); //👉 It finds every underscore (_) in a string and replaces it with a space.

                        cy.log(`Table header: ${actual}`);
                        cy.log(`Main Header: ${expected}`);
                        expect(actual).to.eq(expected);
                        cy.log("✅ Table header matches the main header successfully");
                    });


                // 3️⃣ Verify there are exactly 5 visible rows and print their values
                cy.get("table tbody tr:visible")
                    .should("have.length", 5)
                    .each(($row, index) => {
                        // For each row, collect and print cell values
                        cy.wrap($row)
                            .find("td")
                            .then(($cells) => {
                                // Convert each cell’s text into an array
                                const rowValues = [...$cells].map((cell) => cell.innerText.trim());
                                cy.log(`Row ${index + 1}: ${rowValues.join(" | ")}`);
                            });
                    });
                cy.log("✅ Verified 5 rows — all row data logged successfully");

            } else {
                cy.contains("Error: Failed to fetch sample data.").should("be.visible");
                cy.log("❌ Sample Data not available — 'Failed to fetch sample data' message displayed");
            }
        });



        // ----------------------------------- Access Tab Validation ------------------------------------
        // 🔹 Now click Access
        cy.contains("button", "Access").click();
        cy.wait(2000);

        // 🔹 Verify Access section visible
        cy.contains("Type").first().should("be.visible");
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
        const fields = ["Domain", "Category", "Sub-category", "Term", "Tag", "Sub-tag"];

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
            if ($body.text().includes("No business data available for this column.")) {
                cy.contains("No business data available for this column.").should("be.visible");
                cy.log("⚠️ No business data available for this column in Table Detail View");
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
