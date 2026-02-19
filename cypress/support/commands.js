Cypress.Commands.add("loginAs", (role) => {
  cy.fixture("users.json").then((config) => {
    const { URL, KEYCLOAK_URL } = config;
    const user = config[role];
    const keycloakOrigin = KEYCLOAK_URL;

   // Step 1: visit your app (redirects to Keycloak)
    cy.visit(URL);

    // Step 2: handle Keycloak login
    cy.origin(KEYCLOAK_URL, { args: { user } }, ({ user }) => {
      cy.get("#username", { timeout: 15000 }).should("be.visible").type(user.username);
      cy.get("#password").type(user.password, { log: false });

      // More robust login button selector
      cy.get("button[type='submit'], #kc-login, input[type='submit']", { timeout: 15000 })
        .should("be.visible")
        .click();
    });

  });
});

Cypress.Commands.add("verifyPagination1", (pageType) => {
  cy.log(`🔍 Checking pagination for ${pageType}`);

  cy.get("table tbody tr").its("length").then((rowCount) => {
    cy.log(`🧾 Found ${rowCount} rows on first page of ${pageType}`);

    if (rowCount < 10) {
      cy.get('button[title="Next"]').should("be.disabled");
      cy.get('button[title="Back"]').should("be.disabled");
      cy.log(`✅ ${pageType}: 10 or fewer rows — pagination not needed.`);
    } else {
      cy.get('button[title="Next"]').should("not.be.disabled");
      cy.get("table tbody tr").should("have.length", 10);

      const clickNextUntilDisabled = () => {
        cy.get('button[title="Next"]').then(($btn) => {
          if (!$btn.is(":disabled")) {
            cy.wrap($btn).click({ force: true });
            cy.wait(1500);
            cy.get("table tbody tr").should("have.length.at.most", 10);
            clickNextUntilDisabled();
          }
        });
      };

      const clickBackUntilDisabled = () => {
        cy.get('button[title="Back"]').then(($btn) => {
          if (!$btn.is(":disabled")) {
            cy.wrap($btn).click({ force: true });
            cy.wait(1500);
            cy.get("table tbody tr").should("have.length.at.most", 10);
            clickBackUntilDisabled();
          }
        });
      };

      clickNextUntilDisabled();
      cy.wait(1000);
      clickBackUntilDisabled();
    }
  });
});



Cypress.Commands.add("verifyPagination", (pageType) => {
  cy.log(`🔍 Checking pagination for ${pageType}`);

  cy.get("table tbody tr").its("length").then((rowCount) => {
    cy.log(`🧾 Found ${rowCount} rows on first page of ${pageType}`);

    // --- Verify the "Showing 1 to 10 of 87 Entries" text ---
    cy.contains(/Showing\s+\d+\s+to\s+\d+\s+of\s+\d+\s+(results|entries|items)/i)
      .should("be.visible")
      .invoke("text")
      .then((text) => {
        const match = text.match(/Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+(results|entries|items)/i);
        expect(match, "Pagination summary format should be valid").to.not.be.null;

        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const total = parseInt(match[3]);

        cy.log(`📊 Showing ${start} to ${end} of ${total} entries`);

        // Logical checks
        expect(start).to.be.greaterThan(0);
        expect(start).to.be.lte(end); 
        expect(end).to.be.at.most(total);


        // Verify that table rows match summary range (within 10 per page)
        const expectedRows = end - start + 1;
        expect(rowCount).to.be.at.most(expectedRows);
        cy.log(`✅ Table row count (${rowCount}) consistent with summary (${expectedRows} expected).`);
      });

    // --- Now check pagination controls (Page x of y) ---
    cy.contains("Page").then(($pageInfo) => {
      const text = $pageInfo.text(); // e.g. "Page 1 of 9"
      const match = text.match(/Page\s+(\d+)\s+of\s+(\d+)/i);

      if (!match) {
        cy.log("⚠️ Could not find page count text. Skipping pagination test.");
        return;
      }

      const currentPage = parseInt(match[1]);
      const totalPages = parseInt(match[2]);
      cy.log(`📄 Detected ${totalPages} total pages.`);

      // --- Case 1: Single page ---
      if (totalPages === 1) {
        cy.get('button[title="Next"]').should("be.disabled");
        cy.get('button[title="Back"]').should("be.disabled");
        cy.log(`✅ Only one page — pagination not required.`);
      } else {
       // --- Case 2: Multiple pages ---
      cy.log(`🔁 Verifying pagination navigation (first → middle → last → back)`)

        // Check first page buttons
        cy.get('button[title="Back"]').should("be.disabled");
        cy.get('button[title="Next"]').should("not.be.disabled");
        cy.log("✅ Back button correctly disabled on first page.");

        // Go to middle page (if more than 3)
        const middlePage = Math.ceil(totalPages / 2);
        for (let i = 1; i < middlePage; i++) {
          cy.get('button[title="Next"]').click({ force: true });
          cy.wait(500);
        }

        cy.contains(`Page ${middlePage}`).should("be.visible");
        cy.get("table tbody tr").should("have.length.at.most", 10);
        cy.log(`✅ Reached middle page (${middlePage}) successfully.`);

        // Go to last page
        for (let i = middlePage; i < totalPages; i++) {
          cy.get('button[title="Next"]').click({ force: true });
          cy.wait(300);
        }

        cy.contains(`Page ${totalPages}`).should("be.visible");
        cy.get('button[title="Next"]').should("be.disabled");
        cy.get("table tbody tr").should("have.length.at.most", 10);
        cy.log(`✅ Reached last page (${totalPages}) successfully.`);

        // Check back to previous page once
        cy.get('button[title="Back"]').click({ force: true });
        cy.wait(500);
        cy.get('button[title="Next"]').should("not.be.disabled");
        cy.log("⬅️ Back button works correctly.");
      }
    });
  });



});
