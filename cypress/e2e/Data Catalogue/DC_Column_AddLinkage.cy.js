/// <reference types="cypress" />

describe("Column Page - Option B (all functions inside spec)", () => {

    let userData;


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

    // ============================================================
    //  LOCAL FUNCTION: OPEN NOTIFICATIONS
    // ============================================================
    const openNotificationsAndView = (searchValue) => {
        cy.xpath("//button[@aria-label='Notifications']").should("be.visible").click();
        cy.xpath("//h3[text() ='Notifications']").should("be.visible");
        cy.get(".lucide.lucide-refresh-ccw").should("be.visible").click();
        cy.contains("div", searchValue, { timeout: 15000 }).should("be.visible").within(() => {
            cy.get('button[title="View details"]').click({ force: true });
        });
    };

    

    // ============================================================
    //  LOCAL FUNCTION: VERIFY NOTIFICATION TEXT
    // ============================================================
    const verifyNotificationContains = (searchValue, expectedArr) => {
        cy.xpath("//button[@aria-label='Notifications']").click({ force: true });

        cy.contains("div", searchValue, { timeout: 15000 })
            .should("be.visible")
            .within(() => {
                cy.get("p").invoke("text").then((txt) => {
                    expectedArr.forEach((e) => {
                        expect(txt).to.contain(e);
                    });
                });
            });
    };

    // ============================================================
    //  TEST DATA
    // ============================================================
    before(() => {
        cy.fixture("DataCatalogue/Column_AddLinkage.json").then((data) => {
            userData = data;
        });
    });

    // ============================================================
    //  BEFORE EACH: LOGIN & NAVIGATION
    // ============================================================
    beforeEach(() => {
        cy.loginAs(userData.Role);
        cy.contains("button", "Data Governance").click();
        cy.xpath("(//button[contains(@class, 'p-1')])[2]").click();
        cy.xpath("//a[@href='/datagovernance/data-catalogue/column']").click();
    });

    // ============================================================
    //  MAIN TEST
    // ============================================================
    it("Add linkage → Data Owner → Data Steward approve/reject", () => {

        // Search the table
        cy.xpath("//input[@placeholder='Search Tables']")
            .clear()
            .type(userData.Searchvalue);

        // Regular user cannot add linkage
        if (userData.Role === "RegularUser") {
            return cy.xpath("//button[@title='Link Business Definition to Table']").should("not.exist");
        }

        // Add linkage
        cy.xpath("//button[@title='Link Business Definition to Table']").click();
        cy.contains("span", "Edit Table").should("be.visible");

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


        cy.contains("button", "Save").click();

        // ======================================
        //  IF USER = DATA STEWARD
        // ======================================
        if (userData.Role === "dataSteward") {
            cy.contains("Catalogue items added successfully.").should("be.visible");
            cy.contains("td", userData.Searchvalue).click({ force: true });
            cy.contains("button", "Table Detail View").click();
            return;
        }

        // ======================================
        //  OWNER FLOW — REQUEST SENT
        // ======================================
        cy.xpath("//div[contains(text(), 'Request sent to Data Steward for approval') or contains(text(), 'Another catalogue entry is already awaiting approval')]",
            { timeout: 15000 }
        ).should("be.visible")
            .then(($msg) => {
                if ($msg.text().includes("Another catalogue entry")) {
                    cy.xpath("//button[@title='Close']").click({ force: true });
                }
            });

        logout();
        cy.loginAs(userData.Role1); // login as steward

        // ======================================
        //  NOTIFICATION VIEW
        // ======================================
        openNotificationsAndView(userData.Searchvalue);

        cy.get(".bg-white.rounded-lg.shadow-xl.w-full").should("be.visible");
        cy.contains("h4", "APPROVAL FOR LINKAGE").should("be.visible");
        cy.contains("p", "Table:").should("be.visible").and("contain.text", userData.Searchvalue);

        // ======================================
        //  APPROVAL
        // ======================================
        if (userData.ApproveOrReject === "Approve") {
            cy.contains("button", "Approve").click({ force: true });
            cy.contains("Entry Approved Successfully").should("be.visible");

            logout();
            cy.loginAs(userData.Role);

            verifyNotificationContains(userData.Searchvalue, [
                "Your entry for Catalogue linkage to",
                userData.Searchvalue,
                "has been approved"
            ]);
            return;
        }

        // ======================================
        //  REJECTION
        // ======================================
        cy.contains("button", "Reject").click({ force: true });
        cy.contains("label", "Reason for Rejection").scrollIntoView().should("be.visible");

        cy.get("textarea").type(userData.RejectionReason);
        cy.contains("button", "Confirm Rejection").click({ force: true });
        cy.contains("Entry Rejected Successfully").should("be.visible");

        // Owner checks rejection
        logout();
        cy.loginAs(userData.Role);

        verifyNotificationContains(userData.Searchvalue, [
            "Your entry for Catalogue linkage to",
            userData.Searchvalue,
            "has been rejected"
        ]);
        
        cy.contains("div", userData.Searchvalue).within(() => {
            cy.contains("span", "Reason:").invoke("text").then((t) => {
                expect(t.trim()).to.eq(`Reason: ${userData.RejectionReason}`);
            });
        });
    });

});
