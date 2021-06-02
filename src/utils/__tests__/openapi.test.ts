import {
  detectType,
  getOperationSummary,
  getStatusCodeType,
  humanizeConstraints,
  isOperationName,
  isPrimitiveType,
  mergeParams,
  normalizeServers,
  pluralizeType,
  serializeParameterValue,
  sortByRequired,
} from '../';

import { FieldModel, OpenAPIParser, RedocNormalizedOptions } from '../../services';
import { OpenAPIParameter, OpenAPIParameterLocation, OpenAPIParameterStyle } from '../../types';
import { expandDefaultServerVariables } from '../openapi';

describe('Utils', () => {
  describe('openapi getStatusCode', () => {
    it('Should return info for status codes within 100 and 200', () => {
      expect(getStatusCodeType(100)).toEqual('info');
      expect(getStatusCodeType(150)).toEqual('info');
      expect(getStatusCodeType(199)).toEqual('info');
    });

    it('Should return success for status codes within 200 and 300', () => {
      expect(getStatusCodeType(200)).toEqual('success');
      expect(getStatusCodeType(250)).toEqual('success');
      expect(getStatusCodeType(299)).toEqual('success');
    });
    it('Should return redirect for status codes within 300 and 400', () => {
      expect(getStatusCodeType(300)).toEqual('redirect');
      expect(getStatusCodeType(399)).toEqual('redirect');
    });
    it('Should return error for status codes above 400', () => {
      expect(getStatusCodeType(400)).toEqual('error');
      expect(getStatusCodeType(500)).toEqual('error');
      expect(getStatusCodeType(599)).toEqual('error');
    });

    it('Should throw for incorrect HTTP code', () => {
      expect(() => getStatusCodeType(99)).toThrow('invalid HTTP code');
      expect(() => getStatusCodeType(600)).toThrow('invalid HTTP code');
    });
  });

  describe('openapi isOperationName', () => {
    it('Should return `true` for correct HTTP verbs', () => {
      expect(isOperationName('get')).toEqual(true);
      expect(isOperationName('post')).toEqual(true);
      expect(isOperationName('put')).toEqual(true);
      expect(isOperationName('head')).toEqual(true);
      expect(isOperationName('patch')).toEqual(true);
      expect(isOperationName('delete')).toEqual(true);
      expect(isOperationName('options')).toEqual(true);
    });

    it('Should return `false` for incorrect HTTP verbs', () => {
      expect(isOperationName('properties')).toEqual(false);
      expect(isOperationName('x-name')).toEqual(false);
      expect(isOperationName('fix')).toEqual(false);
    });
  });

  let sixtyLetterStr = '';
  for (let i = 0; i < 60; i++) {
    sixtyLetterStr += 'a';
  }

  describe('openapi getOperationSummary', () => {
    it('Should return operation self summary if exists', () => {
      const operation = {
        summary: 'test',
        operationId: 'fail',
        description: 'fail',
      };
      expect(getOperationSummary(operation as any)).toEqual('test');
    });

    it('Should return operationId if no summary', () => {
      const operation = {
        operationId: 'test',
        description: 'fail',
      };
      expect(getOperationSummary(operation as any)).toEqual('test');
    });

    it('Should return description if no summary and operationId', () => {
      const operation = {
        description: 'test',
      };
      expect(getOperationSummary(operation as any)).toEqual('test');
    });

    it('Should return only first 50 description letter if no summary and operationId', () => {
      const operation = {
        description: sixtyLetterStr,
      };
      expect(sixtyLetterStr.length).toBeGreaterThan(50);
      expect(getOperationSummary(operation as any).length).toBe(50);
    });

    it('Should return pathName if no summary, operationId, description', () => {
      const operation = {
        pathName: '/sandbox/test'
      };
      expect(getOperationSummary(operation as any)).toBe('/sandbox/test');
    });

    it('Should return <no summary> if no info', () => {
      const operation = {
        description: undefined,
      };
      expect(getOperationSummary(operation as any)).toBe('<no summary>');
    });
  });

  describe('openapi detectType', () => {
    it('Should detect object.type if it is specified', () => {
      expect(
        detectType({
          type: 'object',
        }),
      ).toBe('object');

      expect(
        detectType({
          type: 'object',
          minimum: 1,
        }),
      ).toBe('object');
    });

    const tests = {
      number: ['multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum'],

      string: ['pattern', 'minLength', 'maxLength'],

      array: ['items', 'maxItems', 'minItems', 'uniqueItems'],
      object: ['maxProperties', 'minProperties', 'required', 'additionalProperties', 'properties'],
    };

    Object.keys(tests).forEach(name => {
      it(`Should detect ${name} if ${name} properties are present`, () => {
        tests[name].forEach(propName => {
          expect(
            detectType({
              [propName]: 0,
            }),
          ).toBe(name);
        });
      });
    });
  });

  describe('openapi isPrimitiveType', () => {
    it('Should return true for empty object', () => {
      const schema = {
        type: 'object',
      };
      expect(isPrimitiveType(schema)).toEqual(true);
    });

    it('Should return false for object with props', () => {
      const schema = {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should return true for array contains object and schema hasn\'t properties', () => {
      const schema = {
        type: ['object', 'string'],
      };
      expect(isPrimitiveType(schema)).toEqual(true);
    });

    it('should return false for array contains object and schema has properties', () => {
      const schema = {
        type: ['object', 'string'],
        properties: {
          a: {
            type: 'string',
          },
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should return false for array contains array type and schema has items', () => {
      const schema = {
        type: ['array'],
        items: {
          type: 'object',
          additionalProperties: true,
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should return false for array contains object and array types and schema has items', () => {
      const schema = {
        type: ['array', 'object'],
        items: {
          type: 'object',
          additionalProperties: true,
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should return false for array contains object and array types and schema has properties', () => {
      const schema = {
        type: ['array', 'object'],
        properties: {
          a: {
            type: 'string',
          },
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should return true for array contains array of strings', () => {
      const schema = {
        type: 'array',
        items: {
            type: 'array',
            items: {
              type: 'string'
            },
        },
      };
      expect(isPrimitiveType(schema)).toEqual(true);
    });

    it('Should return true for array of string which include the null value', () => {
      const schema = {
        type: ['object', 'string', 'null'],
      };
      expect(isPrimitiveType(schema)).toEqual(true);
    });

    it('Should return false for array with non-empty objects', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            a: {
              type: 'string',
            },
          },
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should return false for object with additionalProperties', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true,
        },
      };
      expect(isPrimitiveType(schema)).toEqual(false);
    });

    it('should work with externally provided type', () => {
      const schema = {
        properties: {
          a: {
            type: 'string',
          },
        },
      };
      expect(isPrimitiveType(schema, 'object')).toEqual(false);
    });
  });

  describe('openapi mergeParams', () => {
    it('Should deduplicate params with same "name" and "in"', () => {
      const pathParams: OpenAPIParameter[] = [
        {
          name: 'param1',
          in: 'path',
          description: 'path',
        },
        {
          name: 'param2',
          in: 'path',
        },
      ];
      const operationParams: OpenAPIParameter[] = [
        {
          name: 'param1',
          in: 'path',
          description: 'oper',
        },
        {
          name: 'param2',
          in: 'query',
        },
      ];

      const parser = new OpenAPIParser({ openapi: '3.0' } as any);

      const res = mergeParams(parser, pathParams, operationParams) as OpenAPIParameter[];
      expect(res).toHaveLength(3);
      expect(res[0]).toEqual(pathParams[1]);
      expect(res[1]).toEqual(operationParams[0]);
      expect(res[2]).toEqual(operationParams[1]);
    });
  });

  describe('normalize servers', () => {
    it('should make url absolute and strip spec name', () => {
      const res = normalizeServers('http://base.com/spec.yaml', [
        {
          url: '/sandbox/test',
        },
      ]);
      expect(res).toEqual([{ url: 'http://base.com/sandbox/test', description: '' }]);
    });

    it('should correctly resolve url with server relative path', () => {
      const res = normalizeServers('http://base.com/subpath/spec.yaml', [
        {
          url: '/sandbox/test',
        },
      ]);
      expect(res).toEqual([{ url: 'http://base.com/sandbox/test', description: '' }]);
    });

    it('should correctly resolve url with relative path', () => {
      const res = normalizeServers('http://base.com/subpath/spec.yaml', [
        {
          url: 'sandbox/test',
        },
      ]);
      expect(res).toEqual([{ url: 'http://base.com/subpath/sandbox/test', description: '' }]);
    });

    it('should prefer server host over spec`s one', () => {
      const res = normalizeServers('http://base.com/spec.yaml', [
        {
          url: 'https://otherbase.com/sandbox/test',
        },
      ]);
      expect(res).toEqual([{ url: 'https://otherbase.com/sandbox/test', description: '' }]);
    });

    it('should strip trailing slash', () => {
      const res = normalizeServers('', [
        {
          url: 'https://otherbase.com/sandbox/test/',
        },
      ]);
      expect(res).toEqual([{ url: 'https://otherbase.com/sandbox/test', description: '' }]);
    });

    it('should set correct protocol', () => {
      const res = normalizeServers('https://base.com', [
        {
          url: '//base.com/sandbox/test',
          description: 'test',
        },
      ]);
      expect(res).toEqual([{ url: 'https://base.com/sandbox/test', description: 'test' }]);
    });

    it('should expand variables', () => {
      const servers = normalizeServers('', [
        {
          url: 'http://{host}{basePath}',
          variables: {
            host: {
              default: '127.0.0.1',
            },
            basePath: {
              default: '/path/to/endpoint',
            },
          },
        },
        {
          url: 'http://127.0.0.2:{port}',
          variables: {},
        },
        {
          url: 'http://127.0.0.3',
        },
      ]);

      expect(expandDefaultServerVariables(servers[0].url, servers[0].variables)).toEqual(
        'http://127.0.0.1/path/to/endpoint',
      );
      expect(expandDefaultServerVariables(servers[1].url, servers[1].variables)).toEqual(
        'http://127.0.0.2:{port}',
      );
      expect(expandDefaultServerVariables(servers[2].url, servers[2].variables)).toEqual(
        'http://127.0.0.3',
      );
    });
  });

  describe('openapi humanizeConstraints', () => {
    const itemConstraintSchema = (
      min: number | undefined = undefined,
      max: number | undefined = undefined,
      multipleOf: number | undefined = undefined,
      uniqueItems?: boolean,
    ) => ({ type: 'array', minItems: min, maxItems: max, multipleOf, uniqueItems });

    it('should not have a humanized constraint without schema constraints', () => {
      expect(humanizeConstraints(itemConstraintSchema())).toHaveLength(0);
    });

    it('should have a humanized constraint when minItems is set', () => {
      expect(humanizeConstraints(itemConstraintSchema(2))).toContain('>= 2 items');
    });

    it('should have a humanized constraint when maxItems is set', () => {
      expect(humanizeConstraints(itemConstraintSchema(undefined, 8))).toContain('<= 8 items');
    });

    it('should have a humanized constraint when minItems and maxItems are both set', () => {
      expect(humanizeConstraints(itemConstraintSchema(2, 8))).toContain('[ 2 .. 8 ] items');
    });

    it('should have a humanized constraint when minItems and maxItems are the same', () => {
      expect(humanizeConstraints(itemConstraintSchema(7, 7))).toContain('7 items');
    });

    it('should have a humanized constraint when justMinItems is set, and it is equal to 1', () => {
      expect(humanizeConstraints(itemConstraintSchema(1))).toContain('non-empty');
    });

    it('should have a humanized constraint when multipleOf is set, and it is in format of /^0\\.0*1$/', () => {
      expect(humanizeConstraints(itemConstraintSchema(undefined, undefined, 0.01))).toContain(
        'decimal places <= 2',
      );
    });

    it('should have a humanized constraint when multipleOf is set, and it is in format other than /^0\\.0*1$/', () => {
      expect(humanizeConstraints(itemConstraintSchema(undefined, undefined, 0.5))).toContain(
        'multiple of 0.5',
      );
    });

    it('should have a humanized constraint when uniqueItems is set', () => {
      expect(humanizeConstraints(itemConstraintSchema(undefined, undefined, undefined, true))).toContain(
        'unique',
      );
    });
  });

  describe('OpenAPI pluralizeType', () => {
    it('should pluralize all simple types', () => {
      expect(pluralizeType('string')).toEqual('strings');
      expect(pluralizeType('number')).toEqual('numbers');
      expect(pluralizeType('object')).toEqual('objects');
      expect(pluralizeType('integer')).toEqual('integers');
      expect(pluralizeType('boolean')).toEqual('booleans');
      expect(pluralizeType('array')).toEqual('arrays');
    });

    it('should pluralize complex display types', () => {
      expect(pluralizeType('object (Pet)')).toEqual('objects (Pet)');
      expect(pluralizeType('string <email>')).toEqual('strings <email>');
    });

    it('should pluralize oneOf-ed display types', () => {
      expect(pluralizeType('object or string')).toEqual('objects or strings');
      expect(pluralizeType('object (Pet) or number <int64>')).toEqual(
        'objects (Pet) or numbers <int64>',
      );
    });

    it('should not pluralize display types that are already pluralized', () => {
      expect(pluralizeType('strings')).toEqual('strings');
      expect(pluralizeType('objects (Pet)')).toEqual('objects (Pet)');
      expect(pluralizeType('strings <email>')).toEqual('strings <email>');
      expect(pluralizeType('objects or strings')).toEqual('objects or strings');
      expect(pluralizeType('objects (Pet) or numbers <int64>')).toEqual(
        'objects (Pet) or numbers <int64>',
      );
    });
  });

  describe('openapi serializeParameter', () => {
    interface TestCase {
      style: OpenAPIParameterStyle;
      explode: boolean;
      expected: string;
    }

    interface TestValueTypeGroup {
      value: any;
      description: string;
      cases: TestCase[];
    }
    interface TestLocationGroup {
      location: OpenAPIParameterLocation;
      name: string;
      description: string;
      cases: TestValueTypeGroup[];
    }
    const testCases: TestLocationGroup[] = [
      {
        location: 'path',
        name: 'id',
        description: 'path parameters',
        cases: [
          {
            value: 5,
            description: 'primitive values',
            cases: [
              { style: 'simple', explode: false, expected: '5' },
              { style: 'simple', explode: true, expected: '5' },
              { style: 'label', explode: false, expected: '.5' },
              { style: 'label', explode: true, expected: '.5' },
              { style: 'matrix', explode: false, expected: ';id=5' },
              { style: 'matrix', explode: true, expected: ';id=5' },
            ],
          },
          {
            value: [3, 4, 5],
            description: 'array values',
            cases: [
              { style: 'simple', explode: false, expected: '3,4,5' },
              { style: 'simple', explode: true, expected: '3,4,5' },
              { style: 'label', explode: false, expected: '.3,4,5' },
              { style: 'label', explode: true, expected: '.3.4.5' },
              { style: 'matrix', explode: false, expected: ';id=3,4,5' },
              { style: 'matrix', explode: true, expected: ';id=3;id=4;id=5' },
            ],
          },
          {
            value: { role: 'admin', firstName: 'Alex' },
            description: 'object values',
            cases: [
              { style: 'simple', explode: false, expected: 'role,admin,firstName,Alex' },
              { style: 'simple', explode: true, expected: 'role=admin,firstName=Alex' },
              { style: 'label', explode: false, expected: '.role,admin,firstName,Alex' },
              { style: 'label', explode: true, expected: '.role=admin.firstName=Alex' },
              { style: 'matrix', explode: false, expected: ';id=role,admin,firstName,Alex' },
              { style: 'matrix', explode: true, expected: ';role=admin;firstName=Alex' },
            ],
          },
        ],
      },
      {
        location: 'query',
        name: 'id',
        description: 'query parameters',
        cases: [
          {
            value: 5,
            description: 'primitive values',
            cases: [
              { style: 'form', explode: true, expected: 'id=5' },
              { style: 'form', explode: false, expected: 'id=5' },
            ],
          },
          {
            value: [3, 4, 5],
            description: 'array values',
            cases: [
              { style: 'form', explode: true, expected: 'id=3&id=4&id=5' },
              { style: 'form', explode: false, expected: 'id=3,4,5' },
              { style: 'spaceDelimited', explode: true, expected: 'id=3&id=4&id=5' },
              { style: 'spaceDelimited', explode: false, expected: 'id=3%204%205' },
              { style: 'pipeDelimited', explode: true, expected: 'id=3&id=4&id=5' },
              { style: 'pipeDelimited', explode: false, expected: 'id=3|4|5' },
            ],
          },
          {
            value: { role: 'admin', firstName: 'Alex' },
            description: 'object values',
            cases: [
              { style: 'form', explode: true, expected: 'role=admin&firstName=Alex' },
              { style: 'form', explode: false, expected: 'id=role,admin,firstName,Alex' },
              { style: 'deepObject', explode: true, expected: 'id[role]=admin&id[firstName]=Alex' },
            ],
          },
        ],
      },
      {
        location: 'cookie',
        name: 'id',
        description: 'cookie parameters',
        cases: [
          {
            value: 5,
            description: 'primitive values',
            cases: [
              { style: 'form', explode: true, expected: 'id=5' },
              { style: 'form', explode: false, expected: 'id=5' },
            ],
          },
          {
            value: [3, 4, 5],
            description: 'array values',
            cases: [
              { style: 'form', explode: true, expected: 'id=3&id=4&id=5' },
              { style: 'form', explode: false, expected: 'id=3,4,5' },
            ],
          },
          {
            value: { role: 'admin', firstName: 'Alex' },
            description: 'object values',
            cases: [
              { style: 'form', explode: true, expected: 'role=admin&firstName=Alex' },
              { style: 'form', explode: false, expected: 'id=role,admin,firstName,Alex' },
            ],
          },
        ],
      },
      {
        location: 'header',
        name: 'x-id',
        description: 'header parameters',
        cases: [
          {
            value: 5,
            description: 'primitive values',
            cases: [
              { style: 'simple', explode: false, expected: '5' },
              { style: 'simple', explode: true, expected: '5' },
            ],
          },
          {
            value: [3, 4, 5],
            description: 'array values',
            cases: [
              { style: 'simple', explode: false, expected: '3,4,5' },
              { style: 'simple', explode: true, expected: '3,4,5' },
            ],
          },
          {
            value: { role: 'admin', firstName: 'Alex' },
            description: 'object values',
            cases: [
              { style: 'simple', explode: false, expected: 'role,admin,firstName,Alex' },
              { style: 'simple', explode: true, expected: 'role=admin,firstName=Alex' },
            ],
          },
        ],
      },
    ];

    testCases.forEach(locationTestGroup => {
      describe(locationTestGroup.description, () => {
        locationTestGroup.cases.forEach(valueTypeTestGroup => {
          describe(valueTypeTestGroup.description, () => {
            valueTypeTestGroup.cases.forEach(testCase => {
              it(`should serialize correctly when style is ${testCase.style} and explode is ${testCase.explode}`, () => {
                const parameter: OpenAPIParameter = {
                  name: locationTestGroup.name,
                  in: locationTestGroup.location,
                  style: testCase.style,
                  explode: testCase.explode,
                };
                const serialized = serializeParameterValue(parameter, valueTypeTestGroup.value);

                expect(serialized).toEqual(testCase.expected);
              });
            });
          });
        });
      });
    });

    describe('advanced serialization', () => {
      it('should serialize correctly query parameter with content with application/json', () => {
        const parameter: OpenAPIParameter = {
          name: 'id',
          in: 'query',
          content: {
            'application/json': {
              schema: {
                type: 'string',
              },
            },
          },
        };

        const parser = new OpenAPIParser({ openapi: '3.0' } as any);
        const opts = new RedocNormalizedOptions({});

        const field = new FieldModel(parser, parameter, '', opts);
        expect(serializeParameterValue(field, { name: 'test', age: 23 })).toEqual(
          'id={"name":"test","age":23}',
        );
      });

      it('should serialize correctly header parameter with content with application/json', () => {
        const parameter: OpenAPIParameter = {
          name: 'x-header',
          in: 'header',
          content: {
            'application/json': {
              schema: {
                type: 'string',
              },
            },
          },
        };

        const parser = new OpenAPIParser({ openapi: '3.0' } as any);
        const opts = new RedocNormalizedOptions({});

        const field = new FieldModel(parser, parameter, '', opts);
        expect(serializeParameterValue(field, { name: 'test', age: 23 })).toEqual(
          '{"name":"test","age":23}',
        );
      });
    });
  });

  describe('OpenAPI sortByRequired', () => {
    it('should equal to the old data when all items have no required props', () => {
      const fields = [
        {
          name: 'loginName',
          required: false,
        },
        {
          name: 'displayName',
          required: false,
        },
        {
          name: 'email',
          required: false,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ];
      expect(sortByRequired(fields as FieldModel[])).toEqual(fields);
    });

    it('other item should be the same order when some of items are required', () => {
      const fields = [
        {
          name: 'loginName',
          required: true,
        },
        {
          name: 'displayName',
          required: false,
        },
        {
          name: 'email',
          required: true,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ];
      const sortedFields = [
        {
          name: 'loginName',
          required: true,
        },
        {
          name: 'email',
          required: true,
        },
        {
          name: 'displayName',
          required: false,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ];
      expect(sortByRequired(fields as FieldModel[])).toEqual(sortedFields);
    });

    it('should the order of required items is as same as the order parameter ', () => {
      const fields = [
        {
          name: 'loginName',
          required: true,
        },
        {
          name: 'displayName',
          required: true,
        },
        {
          name: 'email',
          required: true,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ];
      expect(
        sortByRequired(fields as FieldModel[], ['siteId', 'displayName', 'loginName', 'email']),
      ).toEqual([
        {
          name: 'displayName',
          required: true,
        },
        {
          name: 'loginName',
          required: true,
        },
        {
          name: 'email',
          required: true,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ]);
      expect(sortByRequired(fields as FieldModel[], ['email', 'displayName'])).toEqual([
        {
          name: 'email',
          required: true,
        },
        {
          name: 'displayName',
          required: true,
        },
        {
          name: 'loginName',
          required: true,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ]);

      expect(sortByRequired(fields as FieldModel[], ['displayName'])).toEqual([
        {
          name: 'displayName',
          required: true,
        },
        {
          name: 'loginName',
          required: true,
        },
        {
          name: 'email',
          required: true,
        },
        {
          name: 'space',
          required: false,
        },
        {
          name: 'type',
          required: false,
        },
        {
          name: 'depIds',
          required: false,
        },
        {
          name: 'depNames',
          required: false,
        },
        {
          name: 'password',
          required: false,
        },
        {
          name: 'pwdControl',
          required: false,
        },
        {
          name: 'csfLevel',
          required: false,
        },
        {
          name: 'priority',
          required: false,
        },
        {
          name: 'siteId',
          required: false,
        },
      ]);
    });
  });
});
