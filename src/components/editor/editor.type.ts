import {
  BlockType,
  CalloutBlockData,
  CodeBlockData,
  HeadingBlockData,
  ImageBlockData,
  MathEquationBlockData,
  NumberedListBlockData,
  TodoListBlockData,
  ToggleListBlockData,
  YjsEditorKey,
  OutlineBlockData,
  TableBlockData,
  TableCellBlockData,
  BlockId,
  BlockData,
  DatabaseNodeData,
  LinkPreviewBlockData,
  FileBlockData,
  GalleryBlockData,
  SubpageNodeData,
  SimpleTableData,
  VideoBlockData,
  ColumnNodeData,
} from '@/application/types';
import { HTMLAttributes } from 'react';
import { Element } from 'slate';

export interface BlockNode extends Element {
  blockId: BlockId;
  type: BlockType;
  data?: BlockData;
}

export interface TextNode extends Element {
  type: YjsEditorKey.text;
  textId: string;
}

export interface PageNode extends BlockNode {
  type: BlockType.Page;
}

export interface ParagraphNode extends BlockNode {
  type: BlockType.Paragraph;
}

export interface HeadingNode extends BlockNode {
  blockId: string;
  type: BlockType.HeadingBlock;
  data: HeadingBlockData;
}

export interface DividerNode extends BlockNode {
  type: BlockType.DividerBlock;
  blockId: string;
}

export interface TodoListNode extends BlockNode {
  type: BlockType.TodoListBlock;
  blockId: string;
  data: TodoListBlockData;
}

export interface ToggleListNode extends BlockNode {
  type: BlockType.ToggleListBlock;
  blockId: string;
  data: ToggleListBlockData;
}

export interface BulletedListNode extends BlockNode {
  type: BlockType.BulletedListBlock;
  blockId: string;
}

export interface NumberedListNode extends BlockNode {
  type: BlockType.NumberedListBlock;
  blockId: string;
  data: NumberedListBlockData;
}

export interface QuoteNode extends BlockNode {
  type: BlockType.QuoteBlock;
  blockId: string;
}

export interface CodeNode extends BlockNode {
  type: BlockType.CodeBlock;
  blockId: string;
  data: CodeBlockData;
}

export interface CalloutNode extends BlockNode {
  type: BlockType.CalloutBlock;
  blockId: string;
  data: CalloutBlockData;
}

export interface LinkPreviewNode extends BlockNode {
  type: BlockType.LinkPreview;
  blockId: string;
  data: LinkPreviewBlockData;
}

export interface FileNode extends BlockNode {
  type: BlockType.FileBlock;
  blockId: string;
  data: FileBlockData;
}

export interface MathEquationNode extends BlockNode {
  type: BlockType.EquationBlock;
  blockId: string;
  data: MathEquationBlockData;
}

export interface ImageBlockNode extends BlockNode {
  type: BlockType.ImageBlock;
  blockId: string;
  data: ImageBlockData;
}

export interface VideoBlockNode extends BlockNode {
  type: BlockType.VideoBlock;
  blockId: string;
  data: VideoBlockData;
}

export interface GalleryBlockNode extends BlockNode {
  type: BlockType.GalleryBlock;
  blockId: string;
  data: GalleryBlockData;
}

export interface OutlineNode extends BlockNode {
  type: BlockType.OutlineBlock;
  blockId: string;
  data: OutlineBlockData;
}

export interface SimpleTableNode extends BlockNode {
  type: BlockType.SimpleTableBlock;
  blockId: string;
  data: SimpleTableData;
}

export interface SimpleTableRowNode extends BlockNode {
  type: BlockType.SimpleTableRowBlock;
  blockId: string;
}

export interface SimpleTableCellBlockNode extends BlockNode {
  type: BlockType.SimpleTableCellBlock;
  blockId: string;
}

export interface TableNode extends BlockNode {
  type: BlockType.TableBlock;
  blockId: string;
  data: TableBlockData;
}

export interface TableCellNode extends BlockNode {
  type: BlockType.TableCell;
  blockId: string;
  data: TableCellBlockData;
}

export interface DatabaseNode extends BlockNode {
  type: BlockType.GridBlock | BlockType.BoardBlock | BlockType.CalendarBlock;
  blockId: string;
  data: DatabaseNodeData;
}

export interface SubpageNode extends BlockNode {
  type: BlockType.SubpageBlock;
  blockId: string;
  data: SubpageNodeData;
}

export interface ColumnsNode extends BlockNode {
  type: BlockType.ColumnsBlock;
  blockId: string;
}

export interface ColumnNode extends BlockNode {
  type: BlockType.ColumnBlock;
  blockId: string;
  data: ColumnNodeData;
}

export interface EditorElementProps<T = Element> extends HTMLAttributes<HTMLDivElement> {
  node: T;
}


