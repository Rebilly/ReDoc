describe('Menu', () => {
  beforeEach(() => {
    cy.visit('e2e/standalone.html');
  });

  it('should have valid items count', () => {
    cy.get('.menu-content')
      .find('li')
      .should('have.length', 6 + (2 + 8 + 1 + 4 + 2) + (1 + 8) + 1);
  });

  it('should sync active menu items while scroll', () => {
    cy.contains('h1', 'Introduction')
      .scrollIntoView()
      .get('[role=menuitem].active')
      .should('have.text', 'Introduction');

    cy.contains('h2', 'Add a new pet to the store')
      .scrollIntoView()
      .wait(100)
      .get('[role=menuitem].active')
      .children()
      .last()
      .should('have.text', 'Add a new pet to the store')
      .should('be.visible');
  });

  it('should update URL hash when clicking on menu items', () => {
    cy.contains('[role=menuitem].-depth1', 'pet').click({ force: true });
    cy.location('hash').should('equal', '#tag/pet');

    cy.contains('[role=menuitem]', 'Find pet by ID').click({ force: true });
    cy.location('hash').should('equal', '#tag/pet/operation/getPetById');
  });

  it('should deactivate tag when other is activated', () => {
    const petItem = () => cy.contains('[role=menuitem].-depth1', 'pet');

    petItem()
      .click({ force: true })
      .should('have.class', 'active');
    cy.contains('[role=menuitem].-depth1', 'store').click({ force: true });
    petItem().should('not.have.class', 'active');
  });
});
