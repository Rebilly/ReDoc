import * as Sampler from 'openapi-sampler';

import { OpenAPIMediaType } from '../../types';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import { SchemaModel } from './Schema';

import { isJsonLike, mapValues } from '../../utils';
import { OpenAPIParser } from '../OpenAPIParser';
import { ExampleModel } from './Example';

export class MediaTypeModel {
  examples?: { [name: string]: ExampleModel };
  schema?: SchemaModel;
  name: string;
  isRequestType: boolean;
  onlyRequiredInSamples: boolean;

  /**
   * @param isRequestType needed to know if skipe RO/RW fields in objects
   */
  constructor(
    parser: OpenAPIParser,
    name: string,
    isRequestType: boolean,
    info: OpenAPIMediaType,
    options: RedocNormalizedOptions,
  ) {
    this.name = name;
    this.isRequestType = isRequestType;
    this.schema = info.schema && new SchemaModel(parser, info.schema, '', options);
    this.onlyRequiredInSamples = options.onlyRequiredInSamples;
    if (info.examples !== undefined) {
      this.examples = mapValues(
        info.examples,
        example => new ExampleModel(parser, example, name, info.encoding),
      );
    } else if (info.example !== undefined) {
      this.examples = {
        default: new ExampleModel(
          parser,
          { value: parser.shalowDeref(info.example) },
          name,
          info.encoding,
        ),
      };
    } else if (isJsonLike(name)) {
      this.generateExample(parser, info, options.disableDefaultSample);
    }
  }

  generateExample(parser: OpenAPIParser, info: OpenAPIMediaType, disableDefaultSample: boolean) {
    const samplerOptions = {
      skipReadOnly: this.isRequestType,
      skipNonRequired: this.isRequestType && this.onlyRequiredInSamples,
      skipWriteOnly: !this.isRequestType,
      maxSampleDepth: 10,
    };
    if (this.schema && this.schema.oneOf) {
      this.examples = {};
      for (const subSchema of this.schema.oneOf) {
        const sample = Sampler.sample(subSchema.rawSchema, samplerOptions, parser.spec);

        if (this.schema.discriminatorProp && typeof sample === 'object' && sample) {
          sample[this.schema.discriminatorProp] = subSchema.title;
        }

        this.examples[subSchema.title] = new ExampleModel(
          parser,
          {
            value: sample,
          },
          this.name,
          info.encoding,
        );
      }
    } else if (this.schema) {
      const sampledData = Sampler.sample(info.schema, samplerOptions, parser.spec);

      if (disableDefaultSample && info.schema) {
        const properties = parser.deref(info.schema)?.properties  || {};
        Object.keys(properties).map((propName) => {
          const property = properties[propName];
          if (!property.example && sampledData[propName] !== undefined) {
            delete sampledData[propName];
          }
        });
      }

      this.examples = {
        default: new ExampleModel(
          parser,
          { value: sampledData },
          this.name,
          info.encoding,
        ),
      };
    }
  }
}
