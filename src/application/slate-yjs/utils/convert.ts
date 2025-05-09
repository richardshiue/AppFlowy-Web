import { BlockJson } from '@/application/slate-yjs/types';
import { sortTableCells } from '@/application/slate-yjs/utils/table';
import {
  BlockData,
  BlockType,
  YDoc,
  YjsEditorKey,
  YSharedRoot,
} from '@/application/types';
import { TableCellNode } from '@/components/editor/editor.type';
import { Element, Text, Node } from 'slate';
import {
  createBlock,
  getBlock, getBlocks,
  getChildrenMap, getPageId,
  getText,
  getTextMap,
  updateBlockParent,
} from '@/application/slate-yjs/utils/yjs';

export function traverseBlock(id: string, sharedRoot: YSharedRoot): Element | undefined {
  const textMap = getTextMap(sharedRoot);
  const childrenMap = getChildrenMap(sharedRoot);
  const blocks = getBlocks(sharedRoot);
  const block = blocks.get(id)?.toJSON() as BlockJson;

  if(!block) {
    console.error('Block not found', id);
    return {
      blockId: id,
      type: 'block_not_found',
      data: {},
      relationId: id,
      children: [{ type: 'text', textId: id, children: [{ text: '' }] }],
    };
  }

  const childrenId = block.children as string;

  const children = (childrenMap.get(childrenId)?.toJSON() ?? []).map((childId: string) => {
    return traverseBlock(childId, sharedRoot);
  }).filter(Boolean) as (Element | Text)[];

  const slateNode = blockToSlateNode(block);

  if(slateNode.type === BlockType.TableBlock) {
    slateNode.children = sortTableCells(children as TableCellNode[]);
  } else if(slateNode.type === BlockType.TableCell) {
    slateNode.children = children.slice(0, 1);
  } else {
    slateNode.children = children;
  }

  if(slateNode.type === BlockType.Page) {
    return slateNode;
  }

  let textId = block.external_id as string;

  let delta;

  const yText = textId ? textMap.get(textId) : undefined;

  if(!yText) {

    if(children.length === 0) {
      children.push({
        text: '',
      });
    }

    // Compatible data
    // The old version of delta data is fully covered through the data field
    if(slateNode.data) {
      const data = slateNode.data as BlockData;

      if(YjsEditorKey.delta in data) {
        textId = block.id;
        delta = data.delta;
      } else {
        return slateNode;
      }
    }
  } else {
    delta = yText.toDelta();
  }

  try {
    const slateDelta = delta.flatMap(deltaInsertToSlateNode);

    if(slateDelta.length === 0) {
      slateDelta.push({
        text: '',
      });
    }

    const textNode: Element = {
      textId,
      type: YjsEditorKey.text,
      children: slateDelta,
    };

    children.unshift(textNode);
    return slateNode;
  } catch(e) {
    return;
  }
}

export function yDataToSlateContent(sharedRoot: YSharedRoot): Element | undefined {
  try {
    const rootId = getPageId(sharedRoot);
    const blocks = getBlocks(sharedRoot);
    const root = blocks.get(rootId);

    if(!root) return;

    const result = traverseBlock(rootId, sharedRoot);

    if(!result) return;

    return result;
  } catch(e) {
    return;
  }
}

export function yDocToSlateContent(doc: YDoc): Element | undefined {
  const sharedRoot = doc.getMap(YjsEditorKey.data_section) as YSharedRoot;

  if(!sharedRoot || sharedRoot.size === 0) return;
  return yDataToSlateContent(sharedRoot);
}

export function blockToSlateNode(block: BlockJson): Element {
  const data = block.data;
  let blockData;

  try {
    blockData = data ? JSON.parse(data) : {};
  } catch(e) {
    // do nothing
  }

  return {
    blockId: block.id,
    relationId: block.children,
    data: blockData,
    type: block.ty,
    children: [],
  };
}

export interface YDelta {
  insert: string;
  attributes?: object;
}

export function deltaInsertToSlateNode({ attributes, insert }: YDelta): Element | Text | Element[] {

  if(attributes) {
    dealWithEmptyAttribute(attributes);
  }

  return {
    ...attributes,
    text: insert,
  };
}

// eslint-disable-next-line
function dealWithEmptyAttribute(attributes: Record<string, any>) {
  for(const key in attributes) {
    if(!attributes[key]) {
      delete attributes[key];
    }
  }
}

// Helper function to convert Slate text node to Delta insert
export function slateNodeToDeltaInsert(node: Text): YDelta {
  const { text, ...attributes } = node;

  return {
    insert: text,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  };
}

export function slateContentInsertToYData(
  parentBlockId: string,
  index: number,
  slateContent: Node[],
  doc: YDoc,
): string[] {
  // Get existing YData structures from the YDoc
  const sharedRoot = doc.getMap(YjsEditorKey.data_section) as YSharedRoot;

  function processNode(node: Element, parentId: string, index: number) {
    const parent = getBlock(parentId, sharedRoot);
    const block = createBlock(sharedRoot, {
      ty: node.type as BlockType,
      data: node.data || {},
    });

    const [textNode, ...children] = (node.children[0] as Element).type === 'text' ? [node.children[0] as Element, ...node.children.slice(1)] : [null, ...node.children];

    if(textNode) {
      const text = getText(block.get(YjsEditorKey.block_external_id), sharedRoot);

      if(text) {
        const ops = (textNode.children as Text[]).map(slateNodeToDeltaInsert);

        text.applyDelta(ops);
      }
    }

    updateBlockParent(sharedRoot, block, parent, index);

    children.forEach((child, i) => {
      if(Element.isElement(child)) {
        processNode(child, block.get(YjsEditorKey.block_id), i);
      }
    });

    return block.get(YjsEditorKey.block_id);
  }

  // Process each top-level node in slateContent
  return slateContent.map((node, i) => {
    return processNode(node as Element, parentBlockId, index + i);
  });
}