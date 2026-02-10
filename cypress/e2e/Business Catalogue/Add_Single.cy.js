/// <reference types="cypress" />

describe("Business Catalogue - Add single Entry ", () => {
    let userData; 
    let data; 

    // FIX: Load the entire fixture data and assign it to the correct variables.
    before(() => {
        cy.fixture("BusinessCatalogue/Single").then((fixtureData) => {
            // Assign the entire fixture to 'data' for catalogue content
            data = fixtureData; 
            // Assign a subset (or the whole thing) to 'userData' for login credentials
            userData = fixtureData; 
        });
    });

    beforeEach(() => {
        // fresh login for every test
        cy.loginAs(userData.Role); 
        cy.wait(2000); 

        // Always navigate to Business Catalogue page
        cy.contains("button", "Data Governance").click();
        cy.xpath("//a[@href='/datagovernance/business-catalogue']").click();
        cy.url().should("include", "/datagovernance/business-catalogue");
    });


    it("Verify Add Catalogue modal opens and Create only Domain -> BC_03", () => {
        // Get the domain data object
        const domainData = data.domains[0];

        // Click Add button to open the modal (Missing in original test, but assumed from context)
        cy.contains("button", "Add").should("exist").click();

        // ------------------------------ Add Domain Only -----------------------------------------
        cy.get("#domain-name").type(domainData.name);
        cy.get("#domain-description").type(domainData.description);
        cy.get("#domain-owner").select(domainData.owner);
        cy.get("#domain-status").select(domainData.status);

        // Select Stakeholders
        cy.xpath("//span[text() = 'Select stakeholders']").click();
        cy.xpath("//input[@placeholder='Search...']").type(domainData.stakeholder);
        cy.contains("li", domainData.stakeholder).click();

        // Save & Exit (Uncommented and parameterized)
        cy.contains("button", "Save & Exit").click(); 
        cy.wait(500);
        cy.contains("successfully").should("be.visible");
        cy.screenshot("Domain created")
    });

  it("Add Catalogue - Create Catalogue with one Domain, one Category, one Sub-category, one Term, one Tag, and one Sub-tag", () =>{
    // Get the specific data objects
    const domainData = data.domains[1];
    // Use the first element of each array (index 0)
    const categoryData = data.categories[0];
    const subCategoryData = data.SubCategories[0];
    const termData = data.terms[0];
    const tagData = data.tags[0];
    const subTagData = data.SubTags[0];

    cy.contains("button", "Add").should("exist").click();

    Cypress.Commands.add("assertNavButtonsDisabled", () => {
      cy.xpath("//button[text()='Save & Exit']").should("be.disabled");
      cy.xpath("//button[text()='Next']").should("be.disabled");
    });

    Cypress.Commands.add("assertNavButtonsEnabled", () => {
      cy.xpath("//button[text()='Save & Exit']").should("be.enabled");
      cy.xpath("//button[text()='Next']").should("be.enabled");
    });

    //------------------------------ Add Domain -----------------------------------------
    cy.assertNavButtonsDisabled();
    cy.get("#domain-name").type(domainData.name);
    cy.get("#domain-description").type(domainData .description);
    cy.get("#domain-owner").select(domainData.owner);
    cy.get("#domain-status").select(domainData.status);
    cy.xpath("//span[text() = 'Select stakeholders']").click();
    cy.xpath("//input[@placeholder='Search...']").type(domainData.stakeholder);
    cy.contains("li", domainData.stakeholder).click();
    cy.xpath("//button[text() = 'Next']").click();

        // ------------------------------ Add Category -----------------------------------------
        cy.assertNavButtonsEnabled();
        cy.contains("button", "Add Category").click();
        cy.assertNavButtonsDisabled();

        cy.xpath("//input[@placeholder='Enter category name']").type(categoryData.name);
        // Corrected description field locator to be more robust
        cy.xpath("//input[@placeholder= 'Description']").type(categoryData.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(categoryData.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(categoryData.status);
        cy.xpath("//button[text() = 'Next']").click();


        // ------------------------------ Add Sub-Category -----------------------------------------
        cy.assertNavButtonsEnabled();
        cy.contains("button", "Add Sub-category").click();
        cy.assertNavButtonsDisabled();
        cy.xpath("//label[text()='Parent Category']/following-sibling::select").select(subCategoryData.parentCategory);
        cy.xpath("//input[@placeholder='Enter sub-category name']").type(subCategoryData.name);
        cy.xpath("//input[@placeholder= 'Description']").type(subCategoryData.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(subCategoryData.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(subCategoryData.status);
        cy.xpath("//button[text() = 'Next']").click();

        // ------------------------------ Add Term -----------------------------------------
        cy.assertNavButtonsEnabled();
        cy.contains("button", "Add Term").click();
        cy.assertNavButtonsDisabled();
        cy.xpath("//input[@placeholder='Enter term name']").type(termData.name);
        cy.xpath("//input[@placeholder= 'Description']").type(termData.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(termData.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(termData.status);
        cy.xpath("//button[text() = 'Next']").click();

        // ------------------------------ Add Tag -----------------------------------------
        cy.assertNavButtonsEnabled();
        cy.contains("button", "Add Tag").click();
        cy.assertNavButtonsDisabled();
        cy.xpath("//input[@placeholder='Enter tag name']").type(tagData.name);
        cy.xpath("//input[@placeholder= 'Description']").type(tagData.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(tagData.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(tagData.status);
        cy.xpath("//button[text() = 'Next']").click();


        // ------------------------------ Add Sub-tag -----------------------------------------
        cy.contains("button", "Add Sub-tag").should("be.visible").click();
        cy.xpath("//label[text()='Parent Tag']/following-sibling::select").select(subTagData.parentTag);
        cy.xpath("//input[@placeholder='Enter sub-tag name']").type(subTagData.name);
        cy.xpath("//input[@placeholder= 'Description']").type(subTagData.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(subTagData.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(subTagData.status);

        // Save & Exit after all steps
        cy.contains("button", "Save & Exit").click();
        cy.wait(500);
        cy.contains("added successfully").should("be.visible");
});

});


