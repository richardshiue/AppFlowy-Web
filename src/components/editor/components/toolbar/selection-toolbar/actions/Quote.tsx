import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { getBlockEntry } from '@/application/slate-yjs/utils/editor';
import { BlockType } from '@/application/types';
import React, { useCallback } from 'react';
import ActionButton from './ActionButton';
import { useTranslation } from 'react-i18next';
import { useSlateStatic } from 'slate-react';
import { ReactComponent as QuoteSvg } from '@/assets/icons/quote.svg';

export function Quote() {
  const { t } = useTranslation();
  const editor = useSlateStatic() as YjsEditor;
  const isActivated = CustomEditor.isBlockActive(editor, BlockType.QuoteBlock);

  const onClick = useCallback(() => {
    try {
      const [node] = getBlockEntry(editor);

      if (!node) return;

      if (node.type === BlockType.QuoteBlock) {
        CustomEditor.turnToBlock(editor, node.blockId as string, BlockType.Paragraph, {});
        return;
      }

      CustomEditor.turnToBlock(editor, node.blockId as string, BlockType.QuoteBlock, {});
    } catch (e) {
      return;
    }
  }, [editor]);

  return (
    <ActionButton active={isActivated} onClick={onClick} tooltip={t('editor.quote')}>
      <QuoteSvg className='h-4 w-4' />
    </ActionButton>
  );
}

export default Quote;
