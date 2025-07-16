Cypress.Commands.add('loginToTantor', () => {
  cy.fixture('config').then(config => {
    cy.visit(config.URL, { failOnStatusCode: false });

    // Handle security warning
    cy.get('body').then($body => {
      if ($body.find('#details-button').length) {
        cy.get('#details-button').click();
        cy.get('#proceed-link').click();
      }
    });

    // Login
    cy.get('#username').type(config.Username);
    cy.get('#password').type(config.Password);
    cy.get('#remember-me').check();
    cy.get("button[type='submit']").click();
  });
});


Cypress.Commands.add('selectSourceConnectionAndSchema', (connectionName, schemaName) => {
  // Click the first button in div with class 'w-full relative'
  cy.get('div.w-full.relative').eq(0).find('button').should('be.visible').click();
  cy.wait(1000);

  // Click source connection
  expect(connectionName, 'srcConnectionName must be defined').to.be.a('string').and.not.empty;
  cy.get('div').contains(connectionName).should('be.visible').should('not.be.disabled').click();
  cy.log(`Clicked source connection: ${connectionName}`);
  cy.wait(1000);

  // Click the second div with class 'w-full relative'
  cy.get('div.w-full.relative').eq(1).find('button').should('be.visible').click();
  cy.wait(1000);

  // Click source schema
  expect(schemaName, 'srcSchemaName must be defined').to.be.a('string').and.not.empty;
  cy.get('div').contains(schemaName).should('be.visible').should('not.be.disabled').click();
  cy.log(`Clicked source schema: ${schemaName}`);
  cy.wait(1000);




Cypress.Commands.add('selectTargetConnectionAndSchema', (connectionName, schemaName) => {
  // Click the third button in div with class 'w-full relative'
  cy.get('div.w-full.relative').eq(3).find('button').should('be.visible').click();
  cy.wait(1000);

  // Click target connection
  expect(connectionName, 'tarConnectionName must be defined').to.be.a('string').and.not.empty;
  cy.get('div').contains(connectionName).should('be.visible').should('not.be.disabled').click();
  cy.log(`Clicked target connection: ${connectionName}`);
  cy.wait(1000);

  // Click the fourth div with class 'w-full relative'
  cy.get('div.w-full.relative').eq(4).should('be.visible').should('not.be.disabled').click();
  cy.wait(1000);

  // Click target schema
  expect(schemaName, 'tarSchemaName must be defined').to.be.a('string').and.not.empty;
  cy.get('div').contains(schemaName).should('be.visible').should('not.be.disabled').click();
  cy.log(`Clicked target schema: ${schemaName}`);
  cy.wait(1000);
});

});
