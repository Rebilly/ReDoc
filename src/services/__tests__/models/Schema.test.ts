/* eslint-disable @typescript-eslint/no-var-requires */
import { SchemaModel } from '../../models/Schema';
import { OpenAPIParser } from '../../OpenAPIParser';
import { RedocNormalizedOptions } from '../../RedocNormalizedOptions';

const opts = new RedocNormalizedOptions({});

describe('Models', () => {
  describe('Schema', () => {
    let parser;

    test('discriminator with one field', () => {
      const spec = require('../fixtures/discriminator.json');
      parser = new OpenAPIParser(spec, undefined, opts);
      const schema = new SchemaModel(parser, spec.components.schemas.Foo, '', opts);
      expect(schema.oneOf).toHaveLength(0);
      expect(schema.discriminatorProp).toEqual('type');
    });

    test('oneOf/allOf titles', () => {
      const spec = require('../fixtures/oneOfTitles.json');
      parser = new OpenAPIParser(spec, undefined, opts);
      const schema = new SchemaModel(parser, spec.components.schemas.Test, '', opts);
      expect(schema.fields).toHaveLength(3);
      const oneOfField = schema.fields![0];
      expect(oneOfField.schema.displayType).toBe('Foo (object) or Bar (object)');
      expect(oneOfField.schema.oneOf![0].title).toBe('Foo');
      expect(oneOfField.schema.oneOf![1].title).toBe('Bar');

      const anyOfField = schema.fields![1];
      expect(anyOfField.schema.displayType).toBe('Foo (object) or Bar (object)');
      expect(anyOfField.schema.oneOf![0].title).toBe('Foo');
      expect(anyOfField.schema.oneOf![1].title).toBe('Bar');
    });

    test('oneOf/allOf schema complex displayType', () => {
      const spec = require('../fixtures/oneOfTitles.json');
      parser = new OpenAPIParser(spec, undefined, opts);
      const schema = new SchemaModel(parser, spec.components.schemas.WithArray, '', opts);
      expect(schema.oneOf).toHaveLength(2);
      expect(schema.displayType).toBe('(Array of strings or numbers) or string');
    });
  });
});
