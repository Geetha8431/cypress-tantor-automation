/// <reference types="cypress" />

// NOTE: This assumes your custom command 'loginAs' is defined 
// in cypress/support/commands.js and handles the login

// Test: Database Details Page - Verify UI
describe("Table Page - Add Linkage to Table", () => {
    let userData;

    // 🔹 Load test data from fixture before running tests
    before(() => {
        cy.fixture("DataCatalogue/Table_AddLinkage.json").then((data) => {
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
    });


    // ============================================================
    //  LOCAL FUNCTION: LOGOUT
    // ============================================================
    const logout = () => {
        cy.log("🔄 Logging out as Data Owner");
        cy.xpath("//button[@aria-label='Open user menu']").click({ force: true });
        cy.xpath("//button[contains(text(), ' Sign Out')]").should("be.visible").click();
        cy.contains('button', "Cancel").should("be.visible");
        cy.contains("button", "Sign Out", { timeout: 10000 }).click({ force: true });
    };



    it("Selected domain checkboxes and logs all domain options and save", () => {
        cy.log(`Searching for Table: "${userData.Searchvalue}"`);
        cy.xpath("//input[@placeholder='Search Tables']").should("be.visible").clear().type(userData.Searchvalue);

        cy.log(`Checking persona behavior for role: ${userData.Role}`);

        if (userData.Role === "RegularUser") {
            cy.xpath("//button[@title='Link Business Definition to Table']").should("not.exist");
            return;
        }

        // Open the 'Edit Table' modal
        cy.xpath("//button[@title='Link Business Definition to Table']").click();

        // Wait for modal to appear
        cy.contains("span", "Edit Table", { timeout: 1000 }).should("be.visible");

        cy.xpath("//button[@aria-label='Add new catalogue item']").should("exist").should("be.visible");
        cy.xpath("//button[@aria-label='Remove catalogue linkage']").should("exist").should("be.visible");


        // ===================================== Domain =========================================
        // Click the Domain dropdown
        cy.xpath("//div[text() ='Domain']/following::button[contains(@class,'w-full border rounded-md p-2')][1]").click();

        // collect domain names
        const domainNames = [];

        // Wait for dropdown items and iterate
        cy.xpath("//div[contains(@class,'overflow-y-auto')]//ul//li", { timeout: 10000 })
            .should("exist")
            .each(($li) => {
                const text = $li.text().trim();
                domainNames.push(text);

                // find the checkbox inside this li and uncheck if already checked
                cy.wrap($li).find("input[type='checkbox']").then(($input) => {
                    if ($input.is(":checked")) {
                        // click the li (or the checkbox) to uncheck
                        cy.wrap($li).click({ force: true });
                        cy.log(`Unchecked: ${text}`);
                    }
                });
            })
            // after iteration, log the collected names
            .then(() => {
                cy.log("All domain options:", JSON.stringify(domainNames));
            });

        // Search & select the desired domain
        cy.xpath("//input[@placeholder='Search...']").should("exist").clear().type(userData.NewDomain);
        cy.xpath(`//div[contains(@class,'overflow-y-auto')]//ul//li[contains(., '${userData.NewDomain}')]`)
            .should("exist")
            .click({ force: true });

        cy.log(`Selected domain: ${userData.NewDomain}`);

        // close the dropdown (if needed)
        cy.xpath("//div[text() ='Domain']/following::button[contains(@class,'w-full border rounded-md p-2')][1]").click({ force: true });




        // ===================================== Category =========================================

        if (userData.Category && userData.Category.trim() !== "") {
            cy.xpath("//div[text()='Category']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click();

            // Step 2: Fetch all category items
            const categoryNames = [];

            cy.xpath("//div[contains(@class,'overflow-y-auto')]//ul//li", { timeout: 10000 })
                .should("exist")
                .each(($li) => {
                    const text = $li.text().trim();
                    categoryNames.push(text);

                    // Step 3: Uncheck any already-checked category
                    cy.wrap($li)
                        .find("input[type='checkbox']")
                        .then(($input) => {
                            if ($input.is(":checked")) {
                                cy.wrap($li).click({ force: true });
                                cy.log(`Unchecked: ${text}`);
                            }
                        });
                })
                .then(() => {
                    // Step 4: Log all categories AFTER the loop finishes
                    cy.log("All category options:", JSON.stringify(categoryNames));
                });

            // Step 5: Search for desired category
            cy.xpath("//input[@placeholder='Search...']")
                .should("exist")
                .clear()
                .type(userData.Category);

            // Step 6: Select the matched category from results
            cy.xpath(`//div[contains(@class,'overflow-y-auto')]//ul//li[contains(., '${userData.Category}')]`)
                .should("exist")
                .click({ force: true });

            cy.log(`Selected category: ${userData.Category}`);

            // Step 7: Close Category dropdown
            cy.xpath("//div[text()='Category']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click({ force: true });

        }
        else {
            cy.log("Skipping Category selection because the value is empty");
        }

        // ===================================== Sub-Category =========================================

        // Only proceed if value is NOT empty
        if (userData.SubCategory && userData.SubCategory.trim() !== "") {

            cy.xpath("//div[text()='Sub-Category']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click();

            const subcategoryNames = [];

            cy.xpath("//div[contains(@class,'overflow-y-auto')]//ul//li", { timeout: 10000 })
                .each(($li) => {
                    const text = $li.text().trim();
                    subcategoryNames.push(text);

                    cy.wrap($li).find("input[type='checkbox']").then(($input) => {
                        if ($input.is(":checked")) {
                            cy.wrap($li).click({ force: true });
                        }
                    });
                })
                .then(() => cy.log("All Sub-Category options:", JSON.stringify(subcategoryNames)));

            cy.xpath("//input[@placeholder='Search...']")
                .clear()
                .type(userData.SubCategory);

            cy.xpath(`//div[contains(@class,'overflow-y-auto')]//ul//li[contains(., '${userData.SubCategory}')]`)
                .click({ force: true });

            cy.log(`Selected Sub-Category: ${userData.SubCategory}`);

            cy.xpath("//div[text()='Sub-Category']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click({ force: true });

        } else {
            cy.log("Skipping Sub-Category selection because the value is empty");
        }

        // ===================================== Tags =========================================

        if (userData.Tag && userData.Tag.trim() !== "") {
            cy.xpath("//div[text()='Tags']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click();

            // Step 2: Fetch all Tag items
            const tagNames = [];

            cy.xpath("//div[contains(@class,'overflow-y-auto')]//ul//li", { timeout: 10000 })
                .should("exist")
                .each(($li) => {
                    const text = $li.text().trim();
                    tagNames.push(text);

                    // Uncheck if selected
                    cy.wrap($li)
                        .find("input[type='checkbox']")
                        .then(($input) => {
                            if ($input.is(":checked")) {
                                cy.wrap($li).click({ force: true });
                                cy.log(`Unchecked: ${text}`);
                            }
                        });
                })
                .then(() => {
                    cy.log("All Tag options:", JSON.stringify(tagNames));
                });

            // Step 3: Search & Select
            cy.xpath("//input[@placeholder='Search...']")
                .should("exist")
                .clear()
                .type(userData.Tag);

            cy.xpath(`//div[contains(@class,'overflow-y-auto')]//ul//li[contains(., '${userData.Tag}')]`)
                .should("exist")
                .click({ force: true });

            cy.log(`Selected Tag: ${userData.Tag}`);

            // Step 4: Close dropdown
            cy.xpath("//div[text()='Tags']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click({ force: true });

        } else {
            cy.log("Skipping Tag selection because the value is empty");
        }




        // ===================================== Sub-Tags =========================================

        if (userData.SubTag && userData.SubTag.trim() !== "") {
            cy.xpath("//div[text()='Sub-tags']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click();

            // Step 2: Fetch all Sub-Tag items
            const subTagNames = [];

            cy.xpath("//div[contains(@class,'overflow-y-auto')]//ul//li", { timeout: 10000 })
                .should("exist")
                .each(($li) => {
                    const text = $li.text().trim();
                    subTagNames.push(text);

                    // Uncheck if selected
                    cy.wrap($li)
                        .find("input[type='checkbox']")
                        .then(($input) => {
                            if ($input.is(":checked")) {
                                cy.wrap($li).click({ force: true });
                                cy.log(`Unchecked: ${text}`);
                            }
                        });
                })
                .then(() => {
                    cy.log("All Sub-Tag options:", JSON.stringify(subTagNames));
                });

            // Step 3: Search for the desired Sub-Tag
            cy.xpath("//input[@placeholder='Search...']")
                .should("exist")
                .clear()
                .type(userData.SubTag);

            // Step 4: Select the matching Sub-Tag
            cy.xpath(`//div[contains(@class,'overflow-y-auto')]//ul//li[contains(., '${userData.SubTag}')]`)
                .should("exist")
                .click({ force: true });

            cy.log(`Selected Sub-Tag: ${userData.SubTag}`);

            // Step 5: Close dropdown
            cy.xpath("//div[text()='Sub-tags']/following::button[contains(@class,'w-full border rounded-md p-2')][1]")
                .click({ force: true });
        }
        else {
            cy.log("Skipping Sub-Tag selection because the value is empty");
        }

        // ==================== save ==================================
        cy.contains('button', 'Cancel').should("be.visible");
        cy.contains("button", "Save").should("be.visible").click();


        // ============================================
        //          VALIDATION BASED ON ROLE
        // ============================================
        if (userData.Role === "dataSteward") {
            cy.contains("Catalogue items added successfully.").should("be.visible");

            // 🔹 Select database from search results
            cy.contains('td', userData.Searchvalue, { timeout: 10000 }).scrollIntoView().should('exist').click({ force: true });

            // ----------------------------------- Business Tab Validation ------------------------------------
            cy.log("🔹 Validating Business Tab");
            cy.contains("button", "Business").click();
            cy.wait(1000);

            cy.log("🔹 Verifying Composite View section");
            // Confirm Composite View and Table Detail View buttons exist
            cy.contains("button", "Composite view").should("be.visible");
            cy.contains("button", "Table Detail View").should("be.visible");

            cy.log("🔹 Switching to Table Detail View");
            cy.contains("button", "Table Detail View").click();
            cy.wait(1000);

        }
        else if (userData.Role === "dataOwner") {

            // DATA OWNER first OR second attempt on this table
            cy.xpath("//div[contains(text(), 'Request sent to Data Steward for approval') or " + "contains(text(), 'Another catalogue entry is already awaiting approval')]",
                { timeout: 15000 }
            )
                .should("be.visible")
                .then(($msg) => {
                    const messageText = $msg.text().trim();
                    cy.log(`🟡 Table message shown: "${messageText}"`);

                    if (messageText.includes("Request sent to Data Steward for approval")) {
                        cy.log("✅ Table update sent for approval (1st attempt).");
                    }
                    else if (messageText.includes("Another catalogue entry is already awaiting approval")) {
                        cy.log("⚠️ A previous request is already pending (2nd attempt).");
                        cy.xpath("//button[@title='Close']").should("be.visible").click();
                    }
                    else {
                        cy.log("❗Unexpected message shown — please verify backend response.");
                    }


                    // ============================================================
                    //              ALWAYS DO APPROVAL PROCESS
                    // ============================================================
                    cy.log("Loging out as Data Owner");
                    logout();
                    cy.wait(1000);

                    cy.log("🔐 Logging in as Data Steward");
                    cy.loginAs(userData.Role1);
                    cy.wait(1000);


                    // ============================================================
                    //           DATA STEWARD: HANDLE APPROVAL/REJECTION
                    // ============================================================
                    cy.log("📬 Opening Notifications as Data Steward");
                    cy.xpath("//button[@aria-label='Notifications']").should("be.visible").click();

                    // Find the notification containing the searched value
                    cy.contains("div", userData.Searchvalue, { timeout: 15000 }).should("be.visible").within(() => {
                        // Click the chevron (View details)
                        cy.get('button[title="View details"]').click({ force: true });
                    });

                    // Now modal should open → verify visible before acting
                    cy.get(".bg-white.rounded-lg.shadow-xl.w-full", { timeout: 15000 }).should("be.visible");  // replace with modal container class

                    // Verify Modal Title and Subtitle
                    cy.contains("h3", "Approval Request Details").should("be.visible");
                    cy.contains("p", "Review the changes before approving or rejecting").should("be.visible");

                    // Verify “APPROVAL FOR LINKAGE” and Table Name
                    cy.contains("h4", "APPROVAL FOR LINKAGE").should("be.visible");
                    cy.contains("p", "Table:").should("be.visible").and("contain.text", userData.Searchvalue);


                    //  Verify the Action Buttons (Approve, Reject, Cancel)
                    cy.contains("button", "Approve").should("be.visible");
                    cy.contains("button", "Reject").should("be.visible");
                    cy.contains("button", "Cancel").should("be.visible");

                    // Verify the Close (X) Icon
                    cy.xpath("//button[@title='Close']").should("be.visible");

                    // 🔥 Decide based on fixture value
                    if (userData.ApproveOrReject === "Approve") {
                        cy.contains("button", "Approve").click({ force: true });
                        cy.contains("Entry Approved Successfully").should("be.visible");
                        cy.log("🟢 Approved successfully");

                        // ============================================================
                        //           DATA Owner: CHECKING "APPROVED" Status BY STEWARD
                        // ============================================================

                        cy.log("🔄 Logging out as Data Steward");
                        logout();

                        cy.wait(1000);

                        cy.log("🔐 Logging in as Data Owner");
                        cy.loginAs(userData.Role);

                        cy.log("📬 Opening Notifications as Data Owner");
                        cy.xpath("//button[@aria-label='Notifications']").should("be.visible").click();

                        // Find the notification containing the searched value
                        cy.contains("div", userData.Searchvalue, { timeout: 15000 }).should("be.visible").within(() => {
                            cy.get('p').invoke('text').should('include', 'Your entry for Catalogue linkage to')
                                .and('include', userData.Searchvalue)
                                .and('include', 'has been approved');
                        });
                        cy.log("Data Owner Request has been Approved by Data Steward ");
                    }
                    else if (userData.ApproveOrReject === "Reject") {
                        cy.contains("button", "Reject").click({ force: true });

                        cy.contains("h4", "APPROVAL FOR LINKAGE").should("be.visible");
                        cy.contains("label", "Reason for Rejection").scrollIntoView().should("be.visible");

                        cy.contains("button", "Confirm Rejection").should("be.disabled");
                        // Enter reason 
                        cy.get("textarea").should("be.visible").type(userData.RejectionReason);

                        // Confirm reject
                        cy.contains("button", "Confirm Rejection").should("not.be.disabled").should("be.visible").click({ force: true });
                        cy.contains("Entry Rejected Successfully").should("be.visible");
                        cy.log("🔴 Rejected successfully");

                        // ============================================================
                        //           DATA Owner: CHECKING "REJECTED" STATUS BY STEWARD
                        // ============================================================

                        cy.log("🔄 Logging out as Data Steward");
                        logout();

                        cy.wait(1000);

                        cy.log("🔐 Logging in as Data Owner");
                        cy.loginAs(userData.Role);

                        cy.log("📬 Opening Notifications as Data Owner");
                        cy.xpath("//button[@aria-label='Notifications']").should("be.visible").click();

                        // Find the notification containing the searched value
                        cy.contains("div", userData.Searchvalue, { timeout: 15000 }).should("be.visible").within(() => {
                            cy.get('p').invoke('text').should('include', 'Your entry for Catalogue linkage to')
                                .and('include', userData.Searchvalue)
                                .and('include', 'has been rejected');
                        });

                        cy.log("Data Owner Request has been rejected by Data Steward ");
                        cy.contains('span', 'Reason:').invoke('text').then((text) => {
                            expect(text.trim()).to.eq(`Reason: ${userData.RejectionReason}`);
                        });

                    }
                });
        }
        else {
            cy.log("⚠️ ApproveOrReject not set correctly in fixture");
        }

    });

    /*
    
        it("Remove the added catalogue", () => {
            cy.log(`Searching for Table: "${userData.Searchvalue}"`);
            cy.xpath("//input[@placeholder='Search Tables']").should("be.visible").clear().type(userData.Searchvalue);
    
            // Open the 'Edit Table' modal
            cy.xpath("//button[@title='Link Business Definition to Table']").click();
    
            // Wait for modal to appear
            cy.contains("span", "Edit Table", { timeout: 10000 }).should("be.visible");
    
            cy.xpath("//button[@aria-label='Remove catalogue linkage']").should("exist").should("be.visible").click();
    
            cy.contains("Catalogue items removed successfully.").should("be.visible");
    
    
        });
    
        */
});

