// tslint:disable:no-implicit-dependencies
import * as yaml from 'yaml-js';

async function loadSpec(url: string): Promise<any> {
  const spec = await (await fetch(url)).text();
  return yaml.load(spec);
}

function initReDoc(win, spec, options = {}) {
  (win as any).Redoc.init(spec, options, win.document.getElementById('redoc'));
}

describe('Servers', () => {
  beforeEach(() => {
    cy.visit('e2e/');
  });

  it('should have valid server', () => {
    cy.window().then(async win => {
      const spec = await loadSpec('/demo/openapi.yaml');
      initReDoc(win, spec, {});

      // TODO add cy-data attributes
      cy.get('[data-section-id="tag/pet/operation/addPet"]').should(
        'contain',
        'http://petstore.swagger.io/v2/pet',
      );

      cy.get('[data-section-id="tag/pet/operation/addPet"]').should(
        'contain',
        'http://petstore.swagger.io/sandbox/pet',
      );
    });
  });

  it('should have valid server for when servers not provided', () => {
    cy.window().then(async win => {
      const spec = await loadSpec('/demo/openapi.yaml');
      delete spec.servers;
      initReDoc(win, spec, {});

      // TODO add cy-data attributes
      cy.get('[data-section-id="tag/pet/operation/addPet"]').should(
        'contain',
        'http://localhost:' + win.location.port + '/pet',
      );
    });
  });

  it('should have valid server for when servers not provided at .html pages', () => {
    cy.visit('e2e/e2e.html');
    cy.window().then(async win => {
      const spec = await loadSpec('/demo/openapi.yaml');
      delete spec.servers;
      initReDoc(win, spec, {});

      // TODO add cy-data attributes
      cy.get('[data-section-id="tag/pet/operation/addPet"]').should(
        'contain',
        'http://localhost:' + win.location.port + '/pet',
      );
    });
  });
});
