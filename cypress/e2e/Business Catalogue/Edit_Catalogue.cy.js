/// <reference types="cypress" />

describe("Business Catalogue - Edit Catalogue -> BC_05", () => {
  let userData;
  let data;

  // FIX: Load the entire fixture data and assign it to the correct variables.
  before(() => {
    cy.fixture("BusinessCatalogue/Edit").then((fixtureData) => {
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



  it("Edit Catalogue - Use JSON to decide which fields to edit", () => {
    // ------------------- Search and open Edit modal -------------------
    const searchInput = cy.xpath("//input[@placeholder='Search catalogue...']");
    searchInput.type(data.searchValue);
    cy.wait(500);

    cy.xpath("//button[@title='See Actions']").click();
    cy.xpath("//button[@title='Edit Domain']").click();


    //------------------------------ Edit Domain -----------------------------------------
    if (data.domain?.description) {
      cy.get("#domain-description").clear().type(data.domain.description);
    }
    if (data.domain?.owner) {
      cy.get("#domain-owner").select(data.domain.owner);
    }
    if (data.domain?.status) {
      cy.get("#domain-status").select(data.domain.status);
    }

    if (data.domain?.stakeholders && data.domain.stakeholders.length > 0) {
      // 1️⃣ Remove all existing selected stakeholders
      cy.xpath("//label[text()='Stakeholder']/following-sibling::div//button[@title='Close']")
        .each(($btn) => {
          cy.wrap($btn).click({ force: true });
        });

      // 2️⃣ Loop through stakeholders and select each
      data.domain.stakeholders.forEach((stakeholder) => {
        // Re-open dropdown for each stakeholder
        cy.xpath("//label[text()='Stakeholder']/following-sibling::div").click();

        // Wait for search input to appear
        cy.xpath("//input[@placeholder='Search...']").should('be.visible').clear().type(stakeholder);

        // Click the matching result
        cy.contains("li", stakeholder).should('be.visible').click();
      });
    }
    cy.xpath("//button[text()='Next']").click();


    //------------------------------ Edit or Create Category -----------------------------------------
    cy.wrap(data.categories).each((cat) => {

      // If empty → CREATE NEW
      if (!cat.currentName || cat.currentName.trim() === "") {

        // Skip if name is also empty (nothing to create)
        if (!cat.name || cat.name.trim() === "") {
          cy.log("⏭ Skipping empty category entry (no name provided)");
          return;
        }

        // CREATE NEW CATEGORY
        cy.log(`🆕 Creating new category: ${cat.name}`);

        cy.contains("button", "Add Category").click();

        cy.get("input[placeholder='Enter category name']")
          .clear()
          .type(cat.name);

        if (cat.description) {
          cy.get("input[placeholder='Description']").type(cat.description);
        }

        if (cat.owner) {
          cy.contains("label", "Owner").parent().find("select").select(cat.owner);
        }

        if (cat.status) {
          cy.contains("label", "Status").parent().find("select").select(cat.status);
        }

        return; // stop here, do NOT try to edit
      }

      // EDIT EXISTING CATEGORY
      cy.xpath(`//button[contains(normalize-space(.), '${cat.currentName}')]`)
        .should("be.visible")
        .click();

      if (cat.name) {
        cy.get("input[placeholder='Enter category name']")
          .clear()
          .type(cat.name);
      }

      if (cat.description) {
        cy.get("input[placeholder='Description']")
          .clear()
          .type(cat.description);
      }

      if (cat.owner) {
        cy.contains("label", "Owner").parent().find("select").select(cat.owner);
      }

      if (cat.status) {
        cy.contains("label", "Status").parent().find("select").select(cat.status);
      }
    });

    cy.contains("button", "Next").click();


    //------------------------------ Create or Edit Sub-Categories -----------------------------------------
    cy.wrap(data.SubCategories).each((sub) => {

      // CREATE new sub-category when currentName is empty
      if (!sub.currentName || sub.currentName.trim() === "") {

        if (!sub.name || sub.name.trim() === "") {
          cy.log("⏭ Skipping empty sub-category entry (no name provided)");
          return;
        }

        cy.log(`🆕 Creating new sub-category: ${sub.name}`);

        cy.contains("button", "Add Sub-Category").click();

        if (sub.parentCategory) {
          cy.xpath("//label[text()='Parent Category']/following-sibling::select")
            .select(sub.parentCategory);
        }

        cy.get("input[placeholder='Enter sub-category name']")
          .type(sub.name);

        if (sub.desc) {
          cy.get("input[placeholder='Description']").type(sub.desc);
        }

        if (sub.owner) {
          cy.contains("label", "Owner").parent().find("select").select(sub.owner);
        }

        if (sub.status) {
          cy.contains("label", "Status").parent().find("select").select(sub.status);
        }

        return; // done creating
      }

      // EDIT existing sub-category
      cy.xpath(`//button[contains(normalize-space(.), '${sub.currentName}')]`)
        .should("be.visible")
        .click();

      if (sub.parentCategory) {
        cy.xpath("//label[text()='Parent Category']/following-sibling::select")
          .select(sub.parentCategory);
      }

      if (sub.name) {
        cy.get("input[placeholder='Enter sub-category name']")
          .clear().type(sub.name);
      }

      if (sub.desc) {
        cy.get("input[placeholder='Description']")
          .clear().type(sub.desc);
      }

      if (sub.owner) {
        cy.contains("label", "Owner").parent().find("select").select(sub.owner);
      }

      if (sub.status) {
        cy.contains("label", "Status").parent().find("select").select(sub.status);
      }

    });

    cy.contains("button", "Next").click();



    //------------------------------ Create or Edit Terms -----------------------------------------
    cy.wrap(data.terms).each((term) => {

      // CREATE new term
      if (!term.currentName || term.currentName.trim() === "") {

        if (!term.name || term.name.trim() === "") {
          cy.log("⏭ Skipping empty term entry (no name provided)");
          return;
        }

        cy.log(`🆕 Creating new term: ${term.name}`);

        cy.contains("button", "Add Term").click();

        cy.get("input[placeholder='Enter term name']").type(term.name);

        if (term.description) {
          cy.get("input[placeholder='Description']").type(term.description);
        }

        if (term.owner) {
          cy.contains("label", "Owner").parent().find("select").select(term.owner);
        }

        if (term.status) {
          cy.contains("label", "Status").parent().find("select").select(term.status);
        }

        return;
      }

      // EDIT existing term
      cy.xpath(`//button[contains(normalize-space(.), '${term.currentName}')]`)
        .should("be.visible")
        .click();

      if (term.name) {
        cy.get("input[placeholder='Enter term name']")
          .clear().type(term.name);
      }

      if (term.description) {
        cy.get("input[placeholder='Description']")
          .clear().type(term.description);
      }

      if (term.owner) {
        cy.contains("label", "Owner").parent().find("select").select(term.owner);
      }

      if (term.status) {
        cy.contains("label", "Status").parent().find("select").select(term.status);
      }

    });

    cy.contains("button", "Next").click();




    //------------------------------ Create or Edit Tags -----------------------------------------
    cy.wrap(data.tags).each((tag) => {

      // CREATE new tag
      if (!tag.currentName || tag.currentName.trim() === "") {

        if (!tag.name || tag.name.trim() === "") {
          cy.log("⏭ Skipping empty tag entry (no name provided)");
          return;
        }

        cy.log(`🆕 Creating new tag: ${tag.name}`);

        cy.contains("button", "Add Tag").click();

        cy.get("input[placeholder='Enter tag name']").type(tag.name);

        if (tag.description) {
          cy.get("input[placeholder='Description']").type(tag.description);
        }

        if (tag.owner) {
          cy.contains("label", "Owner").parent().find("select").select(tag.owner);
        }

        if (tag.status) {
          cy.contains("label", "Status").parent().find("select").select(tag.status);
        }

        return;
      }

      // EDIT existing tag
      cy.xpath(`//button[contains(normalize-space(.), '${tag.currentName}')]`)
        .should("be.visible")
        .click();

      if (tag.name) {
        cy.get("input[placeholder='Enter tag name']")
          .clear().type(tag.name);
      }

      if (tag.description) {
        cy.get("input[placeholder='Description']")
          .clear().type(tag.description);
      }

      if (tag.owner) {
        cy.contains("label", "Owner").parent().find("select").select(tag.owner);
      }

      if (tag.status) {
        cy.contains("label", "Status").parent().find("select").select(tag.status);
      }

    });

    cy.contains("button", "Next").click();



    //------------------------------ Create or Edit Sub-Tags -----------------------------------------
    cy.wrap(data.SubTags).each((sub) => {

      // CREATE new sub-tag
      if (!sub.currentName || sub.currentName.trim() === "") {

        if (!sub.name || sub.name.trim() === "") {
          cy.log("⏭ Skipping empty sub-tag entry (no name provided)");
          return;
        }

        cy.log(`🆕 Creating new sub-tag: ${sub.name}`);

        cy.contains("button", "Add Sub-tag").click();

        if (sub.parentTag) {
          cy.xpath("//label[text()='Parent Tag']/following-sibling::select")
            .select(sub.parentTag);
        }

        cy.get("input[placeholder='Enter sub-tag name']").type(sub.name);

        if (sub.description) {
          cy.get("input[placeholder='Description']").type(sub.description);
        }

        if (sub.owner) {
          cy.contains("label", "Owner").parent().find("select").select(sub.owner);
        }

        if (sub.status) {
          cy.contains("label", "Status").parent().find("select").select(sub.status);
        }

        return;
      }

      // EDIT existing sub-tag
      cy.xpath(`//button[contains(normalize-space(.), '${sub.currentName}')]`)
        .should("be.visible")
        .click();

      if (sub.parentTag) {
        cy.xpath("//label[text()='Parent Tag']/following-sibling::select")
          .select(sub.parentTag);
      }

      if (sub.name) {
        cy.get("input[placeholder='Enter sub-tag name']")
          .clear().type(sub.name);
      }

      if (sub.description) {
        cy.get("input[placeholder='Description']")
          .clear().type(sub.description);
      }

      if (sub.owner) {
        cy.contains("label", "Owner").parent().find("select").select(sub.owner);
      }

      if (sub.status) {
        cy.contains("label", "Status").parent().find("select").select(sub.status);
      }

    });

    cy.xpath("//button[text()='Update & Exit']").click();



  });
});