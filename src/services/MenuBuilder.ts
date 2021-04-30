import {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPISpec,
  OpenAPITag,
  Referenced,
  OpenAPIServer,
  OpenAPIPaths,
} from '../types';
import {
  isOperationName,
  SECURITY_DEFINITIONS_COMPONENT_NAME,
  setSecuritySchemePrefix,
  JsonPointer,
} from '../utils';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GroupModel, OperationModel } from './models';
import { OpenAPIParser } from './OpenAPIParser';
import { RedocNormalizedOptions } from './RedocNormalizedOptions';

export type TagInfo = OpenAPITag & {
  operations: ExtendedOpenAPIOperation[];
  used?: boolean;
};

export type ExtendedOpenAPIOperation = {
  pointer: string;
  pathName: string;
  httpVerb: string;
  pathParameters: Array<Referenced<OpenAPIParameter>>;
  pathServers: Array<OpenAPIServer> | undefined;
  isWebhook: boolean;
} & OpenAPIOperation;

export type TagsInfoMap = Record<string, TagInfo>;

export interface TagGroup {
  name: string;
  tags: string[];
}

export const GROUP_DEPTH = 0;
export type ContentItemModel = GroupModel | OperationModel;

export class MenuBuilder {
  /**
   * Builds page content structure based on tags
   */
  static buildStructure(
    parser: OpenAPIParser,
    options: RedocNormalizedOptions,
  ): ContentItemModel[] {
    const spec = parser.spec;

    const items: ContentItemModel[] = [];
    const tagsMap = MenuBuilder.getTagsWithOperations(spec);

    const mdHeadings = MenuBuilder.addMarkdownItems(
      spec.info.description || '',
      undefined,
      1,
      options,
    );
    const mdHeadingsBefore = mdHeadings.filter(h => !options.sectionsAtTheEnd.includes(h.name));
    const mdHeadingsAfter = mdHeadings.filter(h => options.sectionsAtTheEnd.includes(h.name));

    items.push(...mdHeadingsBefore);
    if (spec['x-tagGroups'] && spec['x-tagGroups'].length > 0) {
      items.push(
        ...MenuBuilder.getTagGroupsItems(parser, undefined, spec['x-tagGroups'], tagsMap, options),
      );

      if (mdHeadingsAfter.length > 0) {
        mdHeadingsAfter[0].topMargin = true;
      }
    } else {
      items.push(...MenuBuilder.getTagsItems(parser, tagsMap, undefined, undefined, options));
    }

    items.push(...mdHeadingsAfter);

    return items;
  }

  /**
   * extracts items from markdown description
   * @param description - markdown source
   */
  static addMarkdownItems(
    description: string,
    parent: GroupModel | undefined,
    initialDepth: number,
    options: RedocNormalizedOptions,
  ): ContentItemModel[] {
    const renderer = new MarkdownRenderer(options);
    const headings = renderer.extractHeadings(description || '');

    if (headings.length && parent && parent.description) {
      parent.description = MarkdownRenderer.getTextBeforeHading(
        parent.description,
        headings[0].name,
      );
    }

    const mapHeadingsDeep = (_parent, items, depth = 1) =>
      items.map(heading => {
        const group = new GroupModel('section', heading, _parent);
        group.depth = depth;
        if (heading.items) {
          group.items = mapHeadingsDeep(group, heading.items, depth + 1);
        }
        if (
          MarkdownRenderer.containsComponent(
            group.description || '',
            SECURITY_DEFINITIONS_COMPONENT_NAME,
          )
        ) {
          setSecuritySchemePrefix(group.id + '/');
        }
        return group;
      });

    return mapHeadingsDeep(parent, headings, initialDepth);
  }

  /**
   * Returns array of OperationsGroup items for the tag groups (x-tagGroups vendor extension)
   * @param tags value of `x-tagGroups` vendor extension
   */
  static getTagGroupsItems(
    parser: OpenAPIParser,
    parent: GroupModel | undefined,
    groups: TagGroup[],
    tags: TagsInfoMap,
    options: RedocNormalizedOptions,
  ): GroupModel[] {
    const res: GroupModel[] = [];
    for (const group of groups) {
      const item = new GroupModel('group', group, parent);
      item.depth = GROUP_DEPTH;
      item.items = MenuBuilder.getTagsItems(parser, tags, item, group, options);
      res.push(item);
    }
    // TODO checkAllTagsUsedInGroups
    return res;
  }

  /**
   * Returns array of OperationsGroup items for the tags of the group or for all tags
   * @param tagsMap tags info returned from `getTagsWithOperations`
   * @param parent parent item
   * @param group group which this tag belongs to. if not provided gets all tags
   */
  static getTagsItems(
    parser: OpenAPIParser,
    tagsMap: TagsInfoMap,
    parent: GroupModel | undefined,
    group: TagGroup | undefined,
    options: RedocNormalizedOptions,
  ): ContentItemModel[] {
    let tagNames;

    if (group === undefined) {
      tagNames = Object.keys(tagsMap); // all tags
    } else {
      tagNames = group.tags;
    }

    const tags = tagNames.map(tagName => {
      if (!tagsMap[tagName]) {
        console.warn(`Non-existing tag "${tagName}" is added to the group "${group!.name}"`);
        return null;
      }
      tagsMap[tagName].used = true;
      return tagsMap[tagName];
    });

    const res: Array<GroupModel | OperationModel> = [];
    for (const tag of tags) {
      if (!tag) {
        continue;
      }
      const item = new GroupModel('tag', tag, parent);
      item.depth = GROUP_DEPTH + 1;

      // don't put empty tag into content, instead put its operations
      if (tag.name === '') {
        const items = [
          ...MenuBuilder.addMarkdownItems(tag.description || '', item, item.depth + 1, options),
          ...this.getOperationsItems(parser, undefined, tag, item.depth + 1, options),
        ];
        res.push(...items);
        continue;
      }

      item.items = [
        ...MenuBuilder.addMarkdownItems(tag.description || '', item, item.depth + 1, options),
        ...this.getOperationsItems(parser, item, tag, item.depth + 1, options),
      ];

      res.push(item);
    }
    return res;
  }

  /**
   * Returns array of Operation items for the tag
   * @param parent parent OperationsGroup
   * @param tag tag info returned from `getTagsWithOperations`
   * @param depth items depth
   */
  static getOperationsItems(
    parser: OpenAPIParser,
    parent: GroupModel | undefined,
    tag: TagInfo,
    depth: number,
    options: RedocNormalizedOptions,
  ): OperationModel[] {
    if (tag.operations.length === 0) {
      return [];
    }

    const res: OperationModel[] = [];
    for (const operationInfo of tag.operations) {
      const operation = new OperationModel(parser, operationInfo, parent, options);
      operation.depth = depth;
      res.push(operation);
    }
    return res;
  }

  /**
   * collects tags and maps each tag to list of operations belonging to this tag
   */
  static getTagsWithOperations(spec: OpenAPISpec): TagsInfoMap {
    const tags: TagsInfoMap = {};
    for (const tag of spec.tags || []) {
      tags[tag.name] = { ...tag, operations: [] };
    }

    getTags(spec.paths);
    if (spec['x-webhooks']) {
      getTags(spec['x-webhooks'], true);
    }

    function getTags(paths: OpenAPIPaths, isWebhook?: boolean) {
      for (const pathName of Object.keys(paths)) {
        const path = paths[pathName];
        const operations = Object.keys(path).filter(isOperationName);
        for (const operationName of operations) {
          const operationInfo = path[operationName];
          let operationTags = operationInfo.tags;

          if (!operationTags || !operationTags.length) {
            // empty tag
            operationTags = [''];
          }

          for (const tagName of operationTags) {
            let tag = tags[tagName];
            if (tag === undefined) {
              tag = {
                name: tagName,
                operations: [],
              };
              tags[tagName] = tag;
            }
            if (tag['x-traitTag']) {
              continue;
            }
            tag.operations.push({
              ...operationInfo,
              pathName,
              pointer: JsonPointer.compile(['paths', pathName, operationName]),
              httpVerb: operationName,
              pathParameters: path.parameters || [],
              pathServers: path.servers,
              isWebhook: !!isWebhook,
            });
          }
        }
      }
    }
    return tags;
  }
}
