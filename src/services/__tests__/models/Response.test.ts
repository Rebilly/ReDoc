import { ResponseModel } from '../../models/Response';
import { OpenAPIParser } from '../../OpenAPIParser';
import { RedocNormalizedOptions } from '../../RedocNormalizedOptions';

const opts = new RedocNormalizedOptions({});
describe('Models', () => {
  describe('ResponseModel', () => {
    let parser;

    beforeEach(() => {
      parser = new OpenAPIParser({ openapi: '3.0.0' } as any, undefined, opts);
    });

    test('should calculate response type based on code', () => {
      let resp = new ResponseModel(parser, '200', false, {}, opts);
      expect(resp.type).toEqual('success');
      resp = new ResponseModel(parser, '120', false, {}, opts);
      expect(resp.type).toEqual('info');
      resp = new ResponseModel(parser, '301', false, {}, opts);
      expect(resp.type).toEqual('redirect');
      resp = new ResponseModel(parser, '400', false, {}, opts);
      expect(resp.type).toEqual('error');
    });

    test('default should be successful by default', () => {
      const resp = new ResponseModel(parser, 'default', false, {}, opts);
      expect(resp.type).toEqual('success');
    });

    test('default should be error if defaultAsError is true', () => {
      const resp = new ResponseModel(parser, 'default', true, {}, opts);
      expect(resp.type).toEqual('error');
    });

    test('ensure extensions are shown if showExtensions is true', () => {
      const options = new RedocNormalizedOptions({ showExtensions: true });
      const resp = new ResponseModel(parser, 'default', true, { 'x-example': {a: 1} } as any, options);
      expect(Object.keys(resp.extensions).length).toEqual(1);
      expect(resp.extensions['x-example']).toEqual({a: 1});
    });
  });
});
