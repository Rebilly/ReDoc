import * as JsonSchemaRefParser from 'json-schema-ref-parser';
/* tslint:disable-next-line:no-implicit-dependencies */
import { convertObj } from 'swagger2openapi';
import { OpenAPISpec } from '../types';

export async function loadAndBundleSpec(specUrlOrObject: object | string): Promise<OpenAPISpec> {
  const parser = new JsonSchemaRefParser();
  const spec = (await parser.bundle(specUrlOrObject, {
    resolve: { http: { withCredentials: false } },
  } as object)) as any;

  let v2Specs = spec;
  if (spec.swagger !== undefined) {
    v2Specs = await convertSwagger2OpenAPI(spec);
  }

  // we can derefrence the schema here for future use.
  // import { cloneDeep } from 'lodash';
  // const derefrencedSpec = await parser.dereference(cloneDeep(spec));
  // const derefed = await parser.dereference(v2Specs, {
  //  resolve: { http: { withCredentials: false } },
  // } as object);

  return v2Specs;

}

export function convertSwagger2OpenAPI(spec: any): Promise<OpenAPISpec> {
  console.warn('[ReDoc Compatibility mode]: Converting OpenAPI 2.0 to OpenAPI 3.0');
  return new Promise<OpenAPISpec>((resolve, reject) =>
    convertObj(spec, { patch: true, warnOnly: true, text: '{}' }, (err, res) => {
      // TODO: log any warnings
      if (err) {
        return reject(err);
      }
      resolve(res && (res.openapi as any));
    }),
  );
}
