import { resolve as urlResolve } from 'url';

import { OpenAPIRef, OpenAPISchema, OpenAPISpec, Referenced } from '../types';

import { appendToMdHeading, IS_BROWSER } from '../utils/';
import { JsonPointer } from '../utils/JsonPointer';
import {
  getDefinitionName,
  isNamedDefinition,
  SECURITY_DEFINITIONS_COMPONENT_NAME,
  SECURITY_DEFINITIONS_JSX_NAME,
} from '../utils/openapi';
import { buildComponentComment, MarkdownRenderer } from './MarkdownRenderer';
import { RedocNormalizedOptions } from './RedocNormalizedOptions';

export type MergedOpenAPISchema = OpenAPISchema & { parentRefs?: string[] };

/**
 * Helper class to keep track of visited references to avoid
 * endless recursion because of circular refs
 */
class RefCounter {
  _counter = {};

  reset(): void {
    this._counter = {};
  }

  visit(ref: string): void {
    this._counter[ref] = this._counter[ref] ? this._counter[ref] + 1 : 1;
  }

  exit(ref: string): void {
    this._counter[ref] = this._counter[ref] && this._counter[ref] - 1;
  }

  visited(ref: string): boolean {
    return !!this._counter[ref];
  }
}

/**
 * Loads and keeps spec. Provides raw spec operations
 */
export class OpenAPIParser {
  specUrl?: string;
  spec: OpenAPISpec;
  mergeRefs: Set<string>;

  private _refCounter: RefCounter = new RefCounter();

  constructor(
    spec: OpenAPISpec,
    specUrl?: string,
    private options: RedocNormalizedOptions = new RedocNormalizedOptions({}),
  ) {
    this.validate(spec);
    this.preprocess(spec);

    this.spec = spec;

    this.mergeRefs = new Set();

    const href = IS_BROWSER ? window.location.href : '';
    if (typeof specUrl === 'string') {
      this.specUrl = urlResolve(href, specUrl);
    }
  }

  validate(spec: any) {
    if (spec.openapi === undefined) {
      throw new Error('Document must be valid OpenAPI 3.0.0 definition');
    }
  }

  preprocess(spec: OpenAPISpec) {
    if (
      !this.options.noAutoAuth &&
      spec.info &&
      spec.components &&
      spec.components.securitySchemes
    ) {
      // Automatically inject Authentication section with SecurityDefinitions component
      const description = spec.info.description || '';
      if (
        !MarkdownRenderer.containsComponent(description, SECURITY_DEFINITIONS_COMPONENT_NAME) &&
        !MarkdownRenderer.containsComponent(description, SECURITY_DEFINITIONS_JSX_NAME)
      ) {
        const comment = buildComponentComment(SECURITY_DEFINITIONS_COMPONENT_NAME);
        spec.info.description = appendToMdHeading(description, 'Authentication', comment);
      }
    }
  }

  /**
   * get spec part by JsonPointer ($ref)
   */
  byRef = <T extends any = any>(ref: string): T | undefined => {
    let res;
    if (!this.spec) {
      return;
    }
    if (ref.charAt(0) !== '#') {
      ref = '#' + ref;
    }
    ref = decodeURIComponent(ref);
    try {
      res = JsonPointer.get(this.spec, ref);
    } catch (e) {
      // do nothing
    }
    return res || {};
  };

  /**
   * checks if the object is OpenAPI reference (contains $ref property)
   */
  isRef(obj: any): obj is OpenAPIRef {
    if (!obj) {
      return false;
    }
    return obj.$ref !== undefined && obj.$ref !== null;
  }

  /**
   * resets visited endpoints. should be run after
   */
  resetVisited() {
    if (process.env.NODE_ENV !== 'production') {
      // check in dev mode
      for (const k in this._refCounter._counter) {
        if (this._refCounter._counter[k] > 0) {
          console.warn('Not exited reference: ' + k);
        }
      }
    }
    this._refCounter = new RefCounter();
  }

  exitRef<T>(ref: Referenced<T>) {
    if (!this.isRef(ref)) {
      return;
    }
    this._refCounter.exit(ref.$ref);
  }

  /**
   * Resolve given reference object or return as is if it is not a reference
   * @param obj object to dereference
   * @param forceCircular whether to dereference even if it is circular ref
   */
  deref<T extends object>(obj: OpenAPIRef | T, forceCircular = false): T {
    if (this.isRef(obj)) {
      const schemaName = getDefinitionName(obj.$ref);
      if (schemaName && this.options.ignoreNamedSchemas.has(schemaName)) {
        return { type: 'object', title: schemaName } as T;
      }

      const resolved = this.byRef<T>(obj.$ref)!;
      const visited = this._refCounter.visited(obj.$ref);
      this._refCounter.visit(obj.$ref);
      if (visited && !forceCircular) {
        // circular reference detected
        // tslint:disable-next-line
        return Object.assign({}, resolved, { 'x-circular-ref': true });
      }
      // deref again in case one more $ref is here
      if (this.isRef(resolved)) {
        const res = this.deref(resolved);
        this.exitRef(resolved);
        return res;
      }
      return resolved;
    }
    return obj;
  }

  shalowDeref<T extends object>(obj: OpenAPIRef | T): T {
    if (this.isRef(obj)) {
      return this.byRef<T>(obj.$ref)!;
    }
    return obj;
  }

  /**
   * Merge allOf constraints.
   * @param schema schema with allOF
   * @param $ref pointer of the schema
   * @param forceCircular whether to dereference children even if it is a circular ref
   */
  mergeAllOf(
    schema: OpenAPISchema,
    $ref?: string,
    forceCircular: boolean = false,
    used$Refs = new Set<string>(),
  ): MergedOpenAPISchema {
    if ($ref) {
      used$Refs.add($ref);
    }

    schema = this.hoistOneOfs(schema);

    if (schema.allOf === undefined) {
      return schema;
    }

    let receiver: MergedOpenAPISchema = {
      ...schema,
      allOf: undefined,
      parentRefs: [],
      title: schema.title || getDefinitionName($ref),
    };

    // avoid mutating inner objects
    if (receiver.properties !== undefined && typeof receiver.properties === 'object') {
      receiver.properties = { ...receiver.properties };
    }
    if (receiver.items !== undefined && typeof receiver.items === 'object') {
      receiver.items = { ...receiver.items };
    }

    const allOfSchemas = schema.allOf
      .map((subSchema) => {
        if (subSchema && subSchema.$ref && used$Refs.has(subSchema.$ref)) {
          return undefined;
        }

        const resolved = this.deref(subSchema, forceCircular);
        const subRef = subSchema.$ref || undefined;
        const subMerged = this.mergeAllOf(resolved, subRef, forceCircular, used$Refs);
        receiver.parentRefs!.push(...(subMerged.parentRefs || []));
        return {
          $ref: subRef,
          schema: subMerged,
        };
      })
      .filter(child => child !== undefined) as Array<{
      $ref: string | undefined;
      schema: MergedOpenAPISchema;
    }>;

    for (const { $ref: subSchemaRef, schema: subSchema } of allOfSchemas) {
      if (
        receiver.type !== subSchema.type &&
        receiver.type !== undefined &&
        subSchema.type !== undefined
      ) {
        console.warn(
          `Incompatible types in allOf at "${$ref}": "${receiver.type}" and "${subSchema.type}"`, //check maybe need delete
        );
      }

      if (subSchema.type !== undefined) {
        if (Array.isArray(subSchema.type) && receiver.type)
          receiver.type = receiver.type?.concat(...subSchema.type)
        else
          receiver.type = subSchema.type;
      }

      if (subSchema.enum !== undefined) {
        if (Array.isArray(subSchema.enum) && receiver.enum)
          receiver.enum = receiver.enum?.concat(...subSchema.enum)
        else
          receiver.enum = subSchema.enum;
      }

      if (subSchema.properties !== undefined) {
        receiver.properties = receiver.properties || {};
        for (const prop in subSchema.properties) {
          if (!receiver.properties[prop]) {
            receiver.properties[prop] = subSchema.properties[prop];
          } else {
            // merge inner properties
            const mergedProp = this.mergeAllOf(
              { allOf: [receiver.properties[prop], subSchema.properties[prop]] },
              $ref + '/properties/' + prop,
            );
            receiver.properties[prop] = mergedProp
            this.exitParents(mergedProp); // every prop resolution should have separate recursive stack
          }
        }
      }

      if (subSchema.items !== undefined) {
        receiver.items = receiver.items || {};
        // merge inner properties
        receiver.items = this.mergeAllOf(
          { allOf: [receiver.items, subSchema.items] },
          $ref + '/items',
        );
      }

      if (subSchema.required !== undefined) {
        receiver.required = (receiver.required || []).concat(subSchema.required);
      }

      // merge rest of constraints
      // TODO: do more intelligent merge
      receiver = { ...subSchema, ...receiver };

      if (subSchemaRef) {
        receiver.parentRefs!.push(subSchemaRef);
        if (receiver.title === undefined && isNamedDefinition(subSchemaRef)) {
          // this is not so correct behaviour. commented out for now
          // ref: https://github.com/Redocly/redoc/issues/601
          // receiver.title = JsonPointer.baseName(subSchemaRef);
        }
      }
    }

    return receiver;
  }

  /**
   * Find all derived definitions among #/components/schemas from any of $refs
   * returns map of definition pointer to definition name
   * @param $refs array of references to find derived from
   */
  findDerived($refs: string[]): Record<string, string[] | string> {
    const res: Record<string, string[]> = {};
    const schemas = (this.spec.components && this.spec.components.schemas) || {};
    for (const defName in schemas) {
      const def = this.deref(schemas[defName]);
      if (
        def.allOf !== undefined &&
        def.allOf.find(obj => obj.$ref !== undefined && $refs.indexOf(obj.$ref) > -1)
      ) {
        res['#/components/schemas/' + defName] = [def['x-discriminator-value'] || defName];
      }
    }
    return res;
  }

  exitParents(shema: MergedOpenAPISchema) {
    for (const parent$ref of shema.parentRefs || []) {
      this.exitRef({ $ref: parent$ref });
    }
  }

  private hoistOneOfs(schema: OpenAPISchema) {
    if (schema.allOf === undefined) {
      return schema;
    }

    const allOf = schema.allOf;
    for (let i = 0; i < allOf.length; i++) {
      const sub = allOf[i];
      if (Array.isArray(sub.oneOf)) {
        const beforeAllOf = allOf.slice(0, i);
        const afterAllOf = allOf.slice(i + 1);
        return {
          oneOf: sub.oneOf.map(part => {
            const merged = this.mergeAllOf({
              allOf: [...beforeAllOf, part, ...afterAllOf],
            });

            // each oneOf should be independent so exiting all the parent refs
            // otherwise it will cause false-positive recursive detection
            this.exitParents(merged);
            return merged;
          }),
        };
      }
    }

    return schema;
  }
}
