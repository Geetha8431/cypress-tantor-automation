/// <reference types="cypress" />

describe("Business Catalogue - Delete Catalogue -> BC_06", () => {
    let userData; 
    let data; 

    // FIX: Load the entire fixture data and assign it to the correct variables.
    before(() => {
        cy.fixture("BusinessCatalogue/Delete").then((fixtureData) => {
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

  it("Admin should be able to delete a catalogue and see success message", () => {
    const searchInput = cy.xpath("//input[@placeholder='Search catalogue...']");
    searchInput.clear().type(userData.Searchvalue);  // FIX: use fixture data
    cy.wait(500);
    
    cy.xpath("//button[@title='See Actions']").click();
    cy.xpath("//button[@title='Delete Domain']").click();
    cy.xpath("//button[text() ='Delete']").click();
    // Assert deletion success
    cy.contains("deleted successfully").should("be.visible");
  });


  it("Verify Catalogue recreation after deletion", () => {
    // Get the domain data object
    const domainData = data.domain;

    // Click Add button to open the modal (Missing in original test, but assumed from context)
    cy.contains("button", "Add").should("exist").click();

    // ------------------------------ Add Domain Only -----------------------------------------
    // Fill out form
    cy.get("#domain-name").type(userData.Searchvalue); // reuse same name (Demo1)
    cy.get("#domain-description").type(domainData.description);
    cy.get("#domain-owner").select(domainData.owner);
    cy.get("#domain-status").select(domainData.status);

    // Select Stakeholders
    cy.xpath("//span[text()='Select stakeholders']").click();
    cy.xpath("//input[@placeholder='Search...']").type(domainData.stakeholder);
    cy.contains("li", domainData.stakeholder).click();

    // Save & verify success
    cy.contains("button", "Save & Exit").click();
    cy.contains("added successfully").should("be.visible");
  });
});