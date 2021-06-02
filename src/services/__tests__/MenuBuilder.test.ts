import { OpenAPIParser } from '../OpenAPIParser';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import { MenuBuilder } from '../MenuBuilder';

describe('MenuBuilder', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const spec = require('./fixtures/showSchemas.json');

  test('should omit Schemas group when showSchemas != true', () => {
    const opts = new RedocNormalizedOptions({});
    const parser = new OpenAPIParser(spec, undefined, opts);
    const menuItems = MenuBuilder.buildStructure(parser, opts);
    expect(menuItems.length).toEqual(1);
  });

  test('should build Schemas group when showSchemas == true', () => {
    const opts = new RedocNormalizedOptions({ showSchemas: true });
    const parser = new OpenAPIParser(spec, undefined, opts);
    const menuItems = MenuBuilder.buildStructure(parser, opts);
    expect(menuItems.length).toEqual(2);
    expect(menuItems[1].name).toEqual('Schemas');
    expect(menuItems[1].items.length).toEqual(1);
    expect(menuItems[1].items[0].name).toEqual('Foo');
  });
});
