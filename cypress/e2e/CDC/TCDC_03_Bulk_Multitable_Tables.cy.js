/// <reference types="cypress" />

describe('Create New CDC pipeline using Bulk options for Multiple Tables', () => {
  let userData;

  before(() => {
    cy.fixture("CDC/Bulk_M.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    cy.loginAs(userData.Role);

    cy.xpath("//a[@href='/connections']").click();
    cy.get('select.w-44').should('be.visible').select(userData.Project);

    cy.xpath("//a[@href='/cdc']").should('be.visible').click();
    cy.url().should("include", "/cdc");
  });

  it('Verify CDC for multiple tables in Bulk', () => {
    // ---------------------------------------------- CDC Page ----------------------------------------------
    cy.contains('a', 'CDC').click();
    cy.contains('button', '+ Create CDC').click();
    //cy.screenshot("after-clicking-createcdc-button");

    // =========================================== Select Source Connection ====================================
    cy.contains('h3', 'Source').should('be.visible');
    cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').click();
    //cy.contains('div, button, label', userData.srcConnectionName).should('be.visible').click();
    // Select from the dropdown panel (auto-retries until visible)
    cy.get('.absolute:visible, .z-50:visible').contains(userData.SrcConnectionName).should('be.visible').click();
    cy.log(`Clicked source connection: ${userData.SrcConnectionName}`);


    // ------------------------------------------- Select Source Schema ----------------------------------------
    cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').click();
    //cy.get('.absolute:visible, .z-50:visible').contains('div, button, label', userData.srcSchemaName).should('be.visible').click();
    // Scoped selection — Cypress automatically waits for the dropdown to render
    cy.get('.absolute:visible, .z-50:visible').contains(userData.SrcSchemaName).should('be.visible').click();
    cy.log(`Clicked source schema: ${userData.SrcSchemaName}`);


    // ------------------------------------------ Select Bulk in Source -----------------------------------------
    cy.contains('label', 'Subset').should('be.visible');
    cy.contains('label', 'Bulk').should('be.visible').click();
    cy.log('Selected Bulk option');

    // ------------------------ Send Source tables into search field and select them ----------------------------
    // Source dataset search and selection
    cy.contains('label', 'Data Set').should('be.visible').click();
    cy.log('Clicked Data Set label');

    // Loop through and select all table names
    userData.SourcetableNames.forEach((tableName) => {
      cy.get('input[placeholder="Search datasets..."]').clear().type(tableName);
      cy.contains('label', tableName).should('be.visible').click();
      cy.wait(500);
    });

    // ----------------------------------------- Select Target connection -----------------------------------------
    // =========================================== Select Target Connection ====================================
    cy.contains('h3', 'Target').should('be.visible');
    cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
    // pick connection from visible dropdown
    cy.get('.absolute:visible, .z-50:visible').contains(userData.TarConnectionName).should('be.visible').click();
    cy.log(`Clicked target connection: ${userData.TarConnectionName}`);

    // ------------------------------------------- Select Target Schema ------------------------------------------
    cy.get('div.w-full.relative').eq(4).find("button").should("be.visible").click();
    // pick schema from visible dropdown
    cy.get('.absolute:visible, .z-50:visible').contains(userData.TarSchemaName).should('be.visible').click();
    cy.log(`Clicked target schema: ${userData.TarSchemaName}`);

    // ------------------------------------------- Select Target tables  --------------------------------------------
    // Loop through and click all target tables
    userData.TargetTableNames.forEach(table => {
      cy.contains('label', table).should('be.visible').click();
    });

    // =============================================== Select Scope ===============================================
    // Click Scope button
    cy.contains('span', 'Scope').should('be.visible').click();
    cy.contains('h2', 'Scope').should('be.visible');

    //-------------------------------- Loop throgh all tables and select operations ---------------------------------
    userData.SourcetableNames.forEach((table) => {
      // Select table from dropdown
      cy.get('select').select(table);
      cy.wait(1000); // Let checkboxes update

      // --------- INSERT ----------
      cy.contains('span', 'Insert')
        .prev('span')
        .then(($insert) => {
          if ($insert.hasClass('Mui-checked')) {
            cy.wrap($insert).click();
            cy.log(`Deselected Insert for ${table}`);
          }
        });

      // --------- UPSERT ----------
      cy.contains('span', 'Upsert')
        .prev('span')
        .then(($upsert) => {
          if (
            !$upsert.hasClass('Mui-disabled') &&
            !$upsert.hasClass('Mui-checked')
          ) {
            cy.wrap($upsert).click();
            cy.log(`Selected Upsert for ${table}`);
          } else {
            cy.log(`Skipped Upsert for ${table}`);
          }
        });

      // --------- DELETE ----------
      cy.contains('span', 'Delete')
        .prev('span')
        .then(($delete) => {
          if (
            !$delete.hasClass('Mui-disabled') &&
            !$delete.hasClass('Mui-checked')
          ) {
            cy.wrap($delete).click();
            cy.log(`Selected Delete for ${table}`);
          } else {
            cy.log(`Skipped Delete for ${table}`);
          }
        });
    });

    //cy.screenshot("after-operation-selection");

    //---------------------------------------- Click Save In Scope --------------------------------------------
    // Click the Save button
    cy.contains('button', 'Save').should('be.visible').click();
    cy.wait(1000);
    cy.contains('button', /^save$/i).should('be.visible').click();
    cy.contains('button', /^yes$/i).should('be.visible').click();
    cy.contains('p', 'saved successfully').should('be.visible');
    //cy.screenshot("after-saved-cdcjob-creation");
    cy.contains('button', /^alright$/i).should('be.visible').should('not.be.disabled').click();
    cy.wait(3000);

    //-------------------------------------------- Click Refresh ------------------------------------------------
    cy.get('button:has(.lucide-refresh-ccw)').scrollIntoView().should('be.visible').click();
    //cy.screenshot("after-refreshed-cdcjob-page");

    /*
    const creationTimestamp = Date.now();  // milliseconds
cy.wrap(creationTimestamp).as("cdcJobTimestamp");
    

  cy.get("@cdcJobTimestamp").then((creationTimestamp) => {

  cy.get("table tbody tr").each(($row, index) => {

    cy.wrap($row).find("td").eq(2).invoke("text").then((createdRaw) => {

      const createdStr = createdRaw.trim();
      if (!createdStr) return;  // skip empty rows

      // Convert "Nov 28, 2025, 13:03:19 AM" → JS Date
      const createdDate = new Date(createdStr);
      const createdTime = createdDate.getTime();

      // ✔ Keep only rows created AFTER we created jobs
      if (createdTime < creationTimestamp) {
        cy.log(`Skipping row ${index} — created earlier (${createdStr})`);
        return;
      }

      cy.log(`Processing NEW job row ${index} — created at: ${createdStr}`);

      // ---------- Read Status Column (col 8) ----------
      cy.wrap($row).find("td").eq(7).invoke("text").then((statusRaw) => {
        const status = statusRaw.trim();

        if (status.includes("Ready to Run")) {
          cy.log(`🟢 Job ${index} is Ready — triggering Run`);
          cy.wrap($row).find('button[aria-label="Open actions menu"]').click();
          cy.xpath('//button[@aria-label="Run"]').click();
        }

        else if (status.includes("Failed")) {
          cy.log(`🔴 Job ${index} FAILED`);
          throw new Error(`❌ CDC Job at row ${index} failed`);
        }

        else {
          cy.log(`ℹ️ Job ${index} current status = ${status}`);
        }
      });

    });

  });

});
*/



  });
});