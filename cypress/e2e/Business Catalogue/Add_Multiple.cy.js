/// <reference types="cypress" />

describe("Business Catalogue - Add Multiple Entry -> BC_04 ", () => {
    let userData; 
    let data; 

    // FIX: Load the entire fixture data and assign it to the correct variables.
    before(() => {
        cy.fixture("BusinessCatalogue/Multiple").then((fixtureData) => {
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



  it("Add Catalogue - Create Catalogue with one Domain but multiple Categories, Sub-categories, Terms, Tags, and Sub-tags", () => {
    cy.contains("button", "Add").should("exist").click();

    //------------------------------ Add Domain -----------------------------------------
    cy.get("#domain-name").type(data.domain.name);
    cy.get("#domain-description").type(data.domain.description);
    cy.get("#domain-owner").select(data.domain.owner);
    cy.get("#domain-status").select(data.domain.status);

    cy.xpath("//span[text() = 'Select stakeholders']").click();
    cy.xpath("//input[@placeholder='Search...']").type(data.domain.stakeholder);
    cy.contains("li", data.domain.stakeholder).click();
    cy.xpath("//button[text() = 'Next']").click();

    //------------------------------ Add Multiple Categories -----------------------------------------
    data.categories.forEach((cat, index) => {
      cy.contains("button", "Add Category").click();
      cy.xpath("//input[@placeholder='Enter category name']").clear().type(cat.name);
      cy.xpath("//input[@placeholder='Description']").clear().type(cat.desc);
      cy.xpath("//label[text()='Owner']/following-sibling::select").select(cat.owner);
      cy.xpath("//label[text()='Status']/following-sibling::select").select(cat.status);

    if (index === data.categories.length - 1) {
    cy.xpath("//button[text()='Next']").click();
    }
});

    //--------------------------- Add Multiple SUb-categories ------------------------
    data.SubCategories.forEach((sub, index) => {
        cy.contains("button", "Add Sub-category").click();  // Use correct button
        cy.xpath("//label[text()='Parent Category']/following-sibling::select").select(sub.parentCategory);
        cy.xpath("//input[@placeholder='Enter sub-category name']").clear().type(sub.name);
        cy.xpath("//input[@placeholder='Description']").clear().type(sub.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(sub.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(sub.status);

    if (index === data.SubCategories.length - 1) {
    cy.xpath("//button[text()='Next']").click();
    }
  });

  //------------------------------ Add Multiple Terms -----------------------------------------
data.terms.forEach((term, index) => {
  cy.contains("button", "Add Term").click();
  cy.xpath("//input[@placeholder='Enter term name']").clear().type(term.name);
  cy.xpath("//input[@placeholder='Description']").clear().type(term.desc);
  cy.xpath("//label[text()='Owner']/following-sibling::select").select(term.owner);
  cy.xpath("//label[text()='Status']/following-sibling::select").select(term.status);

  if (index === data.terms.length - 1) {
    cy.xpath("//button[text()='Next']").click();
  }
});

  //------------------------------ Add Multiple Terms -----------------------------------------
data.tags.forEach((tag, index) => {
  cy.contains("button", "Add Tag").click();
  cy.xpath("//input[@placeholder='Enter tag name']").clear().type(tag.name);
  cy.xpath("//input[@placeholder='Description']").clear().type(tag.desc);
  cy.xpath("//label[text()='Owner']/following-sibling::select").select(tag.owner);
  cy.xpath("//label[text()='Status']/following-sibling::select").select(tag.status);

  if (index === data.tags.length - 1) {
    cy.xpath("//button[text()='Next']").click();
  }
});


    //--------------------------- Add Multiple SUb-categories ------------------------
    data.SubTags.forEach((sub, index) => {
        cy.contains("button", "Add Sub-tag").click();  // Use correct button
        cy.xpath("//label[text()='Parent Tag']/following-sibling::select").select(sub.parentTag);
        cy.xpath("//input[@placeholder='Enter sub-tag name']").clear().type(sub.name);
        cy.xpath("//input[@placeholder='Description']").clear().type(sub.desc);
        cy.xpath("//label[text()='Owner']/following-sibling::select").select(sub.owner);
        cy.xpath("//label[text()='Status']/following-sibling::select").select(sub.status);

    if (index === data.SubTags.length - 1) {
    cy.xpath("//button[text() = 'Save & Exit']").click();
    }
  });

  cy.wait(500);
  cy.contains("added successfully").should("be.visible");

  });
});