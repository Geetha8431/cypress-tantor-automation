describe('Login to Tantor', () => {
  it('should log in to Tantor', function () {
    const username = prompt('Enter Username:');
    const password = prompt('Enter Password:');

    cy.visit('https://darch-test.tantor.io', { failOnStatusCode: false });

    cy.get('body').then($body => {
      if ($body.find('#details-button').length) {
        cy.get('#details-button').click();
        cy.get('#proceed-link').click();
      }
    });

    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#remember-me').check();
    cy.get("button[type='submit']").click();
    cy.url().should('not.include', '/login');
  });
});
