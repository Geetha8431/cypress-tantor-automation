describe('Login to Tantor', () => {
  before(() => {
    cy.fixture('config').then(function (config) {
      this.config = config;
    });
  });

  it('should log in to Tantor', function () {
    cy.visit(this.config.URL, {
      failOnStatusCode: false, // allows proceeding through certificate errors
    });

    // Handle certificate warning if it appears
    cy.get('body').then($body => {
      if ($body.find('#details-button').length) {
        cy.get('#details-button').click();
        cy.get('#proceed-link').click();
      }
    });

    // Fill login form
    cy.get('#username').type(this.config.Username);
    cy.get('#password').type(this.config.Password);
    cy.get('#remember-me').check();

    // Submit form
    cy.get("button[type='submit']").click();

    // Wait for redirection or dashboard to appear (adjust selector as needed)
    cy.url().should('not.include', '/login');
  });
});
