import { action, observable } from 'mobx';
import { MergedOpenAPISchema } from '../';
import { OpenAPIExternalDocumentation, OpenAPISchema, Referenced } from '../../types';
import {
  detectType,
  extractExtensions,
  humanizeConstraints,
  isNamedDefinition,
  isPrimitiveType,
  JsonPointer,
  pluralizeType,
  sortByField,
  sortByRequired,
} from '../../utils/';
import { l } from '../Labels';
import { OpenAPIParser } from '../OpenAPIParser';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import { FieldModel } from './Field';

// TODO: refactor this model, maybe use getters instead of copying all the values
export class SchemaModel {
  pointer: string;

  type: string;
  displayType: string;
  typePrefix: string = '';
  title: string;
  description: string;
  externalDocs?: OpenAPIExternalDocumentation;

  isPrimitive: boolean;
  isCircular: boolean = false;

  format?: string;
  displayFormat?: string;
  nullable: boolean;
  deprecated: boolean;
  pattern?: string;
  example?: any;
  enum: any[];
  default?: any;
  readOnly: boolean;
  writeOnly: boolean;

  constraints: string[];

  fields?: FieldModel[];
  items?: SchemaModel;

  oneOf?: SchemaModel[];
  oneOfType: string;
  discriminatorProp: string;
  @observable
  activeOneOf: number = 0;

  rawSchema: OpenAPISchema;
  schema: MergedOpenAPISchema;
  extensions?: Dict<any>;

  /**
   * @param isChild if schema discriminator Child
   * When true forces dereferencing in allOfs even if circular
   */
  constructor(
    parser: OpenAPIParser,
    schemaOrRef: Referenced<OpenAPISchema>,
    pointer: string,
    private options: RedocNormalizedOptions,
    isChild: boolean = false,
  ) {
    this.pointer = schemaOrRef.$ref || pointer || '';
    this.rawSchema = parser.deref(schemaOrRef);
    this.schema = parser.mergeAllOf(this.rawSchema, this.pointer, isChild);

    this.init(parser, isChild);

    parser.exitRef(schemaOrRef);
    parser.exitParents(this.schema);

    if (options.showExtensions) {
      this.extensions = extractExtensions(this.schema, options.showExtensions);
    }
  }

  /**
   * Set specified alternative schema as active
   * @param idx oneOf index
   */
  @action
  activateOneOf(idx: number) {
    this.activeOneOf = idx;
  }

  init(parser: OpenAPIParser, isChild: boolean) {
    const schema = this.schema;
    this.isCircular = schema['x-circular-ref'];

    this.title =
      schema.title || (isNamedDefinition(this.pointer) && JsonPointer.baseName(this.pointer)) || '';
    this.description = schema.description || '';
    this.type = schema.type || detectType(schema);
    this.format = schema.format;
    this.nullable = !!schema.nullable;
    this.enum = schema.enum || [];
    this.example = schema.example;
    this.deprecated = !!schema.deprecated;
    this.pattern = schema.pattern;
    this.externalDocs = schema.externalDocs;

    this.constraints = humanizeConstraints(schema);
    this.displayType = this.type;
    this.displayFormat = this.format;
    this.isPrimitive = isPrimitiveType(schema, this.type);
    this.default = schema.default;
    this.readOnly = !!schema.readOnly;
    this.writeOnly = !!schema.writeOnly;

    if (this.isCircular) {
      return;
    }

    if (!isChild && getDiscriminator(schema) !== undefined) {
      this.initDiscriminator(schema, parser);
      return;
    } else if (
      isChild &&
      Array.isArray(schema.oneOf) &&
      schema.oneOf.find(s => s.$ref === this.pointer)
    ) {
      // we hit allOf of the schema with the parent discriminator
      delete schema.oneOf;
    }

    if (schema.oneOf !== undefined) {
      this.initOneOf(schema.oneOf, parser);
      this.oneOfType = 'One of';
      if (schema.anyOf !== undefined) {
        console.warn(
          `oneOf and anyOf are not supported on the same level. Skipping anyOf at ${this.pointer}`,
        );
      }
      return;
    }

    if (schema.anyOf !== undefined) {
      this.initOneOf(schema.anyOf, parser);
      this.oneOfType = 'Any of';
      return;
    }

    if (this.type === 'object') {
      this.fields = buildFields(parser, schema, this.pointer, this.options);
    } else if (this.type === 'array' && schema.items) {
      this.items = new SchemaModel(parser, schema.items, this.pointer + '/items', this.options);
      this.displayType = pluralizeType(this.items.displayType);
      this.displayFormat = this.items.format;
      this.typePrefix = this.items.typePrefix + l('arrayOf');
      this.title = this.title || this.items.title;
      this.isPrimitive = this.items.isPrimitive;
      if (this.example === undefined && this.items.example !== undefined) {
        this.example = [this.items.example];
      }
      if (this.items.isPrimitive) {
        this.enum = this.items.enum;
      }
    }
  }

  private initOneOf(oneOf: OpenAPISchema[], parser: OpenAPIParser) {
    this.oneOf = oneOf!.map((variant, idx) => {
      const derefVariant = parser.deref(variant);

      const merged = parser.mergeAllOf(derefVariant, this.pointer + '/oneOf/' + idx);

      // try to infer title
      const title =
        isNamedDefinition(variant.$ref) && !merged.title
          ? JsonPointer.baseName(variant.$ref)
          : merged.title;

      const schema = new SchemaModel(
        parser,
        // merge base schema into each of oneOf's subschemas
        {
          // variant may already have allOf so merge it to not get overwritten
          ...merged,
          title,
          allOf: [{ ...this.schema, oneOf: undefined, anyOf: undefined }],
        } as OpenAPISchema,
        this.pointer + '/oneOf/' + idx,
        this.options,
      );

      parser.exitRef(variant);
      // each oneOf should be independent so exiting all the parent refs
      // otherwise it will cause false-positive recursive detection
      parser.exitParents(merged);

      return schema;
    });

    this.displayType = this.oneOf
      .map(schema => {
        let name =
          schema.typePrefix +
          (schema.title ? `${schema.title} (${schema.displayType})` : schema.displayType);
        if (name.indexOf(' or ') > -1) {
          name = `(${name})`;
        }
        return name;
      })
      .join(' or ');
  }

  private initDiscriminator(
    schema: OpenAPISchema & {
      parentRefs?: string[];
    },
    parser: OpenAPIParser,
  ) {
    const discriminator = getDiscriminator(schema)!;
    this.discriminatorProp = discriminator.propertyName;
    const implicitInversedMapping = parser.findDerived([
      ...[], //...(schema.parentRefs || []), // including parentRefs in all cases is wrong (it is correct for a class with subclasses, but not for one, which only has a superclass)
      this.pointer,
    ]);

    if (schema.oneOf) {
      for (const variant of schema.oneOf) {
        if (variant.$ref === undefined) {
          continue;
        }
        const name = JsonPointer.baseName(variant.$ref);
        implicitInversedMapping[variant.$ref] = name;
      }
    }

    const mapping = discriminator.mapping || {};

    // Defines if the mapping is exhaustive. This avoids having references
    // that overlap with the mapping entries
    let isLimitedToMapping = discriminator['x-explicitMappingOnly'] || false;
    // if there are no mappings, assume non-exhaustive
    if (Object.keys(mapping).length === 0) {
      isLimitedToMapping = false;
    }

    const explicitInversedMapping = {};
    for (const name in mapping) {
      const $ref = mapping[name];

      if (Array.isArray(explicitInversedMapping[$ref])) {
        explicitInversedMapping[$ref].push(name);
      } else {
        // overrides implicit mapping here
        explicitInversedMapping[$ref] = [name];
      }
    }

    const inversedMapping = isLimitedToMapping
      ? { ...explicitInversedMapping }
      : { ...implicitInversedMapping, ...explicitInversedMapping };

    let refs: Array<{ $ref; name }> = [];

    for (const $ref of Object.keys(inversedMapping)) {
      const names = inversedMapping[$ref];
      if (Array.isArray(names)) {
        for (const name of names) {
          refs.push({ $ref, name });
        }
      } else {
        refs.push({ $ref, name: names });
      }
    }

    // Make the listing respects the mapping
    // in case a mapping is defined, the user usually wants to have the order shown
    // as it was defined in the yaml. This will sort the names given the provided
    // mapping (if provided).
    // The logic is:
    // - If a name is among the mapping, promote it to first
    // - Names among the mapping are sorted by their order in the mapping
    // - Names outside the mapping are sorted alphabetically
    const names = Object.keys(mapping);
    if (names.length !== 0) {
      refs = refs.sort((left, right) => {
        const indexLeft = names.indexOf(left.name);
        const indexRight = names.indexOf(right.name);

        if (indexLeft < 0 && indexRight < 0) {
          // out of mapping, order by name
          return left.name.localeCompare(right.name);
        } else if (indexLeft < 0) {
          // the right is found, so mapping wins
          return 1;
        } else if (indexRight < 0) {
          // left wins as it's in mapping
          return -1;
        } else {
          return indexLeft - indexRight;
        }
      });
    }

    this.oneOf = refs.map(({ $ref, name }) => {
      const innerSchema = new SchemaModel(parser, parser.byRef($ref)!, $ref, this.options, true);
      innerSchema.title = name;
      return innerSchema;
    });

    this.fields = buildFields(parser, schema, this.pointer, this.options);
  }
}

function buildFields(
  parser: OpenAPIParser,
  schema: OpenAPISchema,
  $ref: string,
  options: RedocNormalizedOptions,
): FieldModel[] {
  const props = schema.properties || {};
  const additionalProps = schema.additionalProperties;
  const defaults = schema.default || {};
  let fields = Object.keys(props || []).map(fieldName => {
    let field = props[fieldName];

    if (!field) {
      console.warn(
        `Field "${fieldName}" is invalid, skipping.\n Field must be an object but got ${typeof field} at "${$ref}"`,
      );
      field = {};
    }

    const required =
      schema.required === undefined ? false : schema.required.indexOf(fieldName) > -1;

    return new FieldModel(
      parser,
      {
        name: fieldName,
        required,
        schema: {
          ...field,
          default: field.default === undefined ? defaults[fieldName] : field.default,
        },
      },
      $ref + '/properties/' + fieldName,
      options,
    );
  });

  if (options.sortPropsAlphabetically) {
    fields = sortByField(fields, 'name');
  }
  if (options.requiredPropsFirst) {
    // if not sort alphabetically sort in the order from required keyword
    fields = sortByRequired(fields, !options.sortPropsAlphabetically ? schema.required : undefined);
  }

  if (typeof additionalProps === 'object' || additionalProps === true) {
    fields.push(
      new FieldModel(
        parser,
        {
          name: (typeof additionalProps === 'object'
            ? additionalProps['x-additionalPropertiesName'] || 'property name'
            : 'property name'
          ).concat('*'),
          required: false,
          schema: additionalProps === true ? {} : additionalProps,
          kind: 'additionalProperties',
        },
        $ref + '/additionalProperties',
        options,
      ),
    );
  }

  return fields;
}

function getDiscriminator(schema: OpenAPISchema): OpenAPISchema['discriminator'] {
  return schema.discriminator || schema['x-discriminator'];
}
