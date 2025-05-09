import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { EditorMarkFormat } from '@/application/slate-yjs/types';
import ActionButton from '@/components/editor/components/toolbar/selection-toolbar/actions/ActionButton';
import { useSelectionToolbarContext } from '@/components/editor/components/toolbar/selection-toolbar/SelectionToolbar.hooks';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Transforms, Text, Editor } from 'slate';
import { useSlate } from 'slate-react';
import { ReactComponent as MathSvg } from '@/assets/icons/formula.svg';

function Formula() {
  const { t } = useTranslation();
  const editor = useSlate() as YjsEditor;
  const { visible } = useSelectionToolbarContext();
  const [state, setState] = React.useState({
    isActivated: false,
    hasFormulaActivated: false,
    hasMentionActivated: false,
  });

  const { isActivated, hasFormulaActivated, hasMentionActivated } = state;

  const getState = useCallback(() => {
    const isActivated = CustomEditor.isMarkActive(editor, EditorMarkFormat.Formula);
    const hasFormulaActivated = CustomEditor.hasMark(editor, EditorMarkFormat.Formula);
    const hasMentionActivated = CustomEditor.hasMark(editor, EditorMarkFormat.Mention);

    return {
      isActivated,
      hasFormulaActivated,
      hasMentionActivated,
    };
  }, [editor]);

  useEffect(() => {
    if (!visible) return;
    setState(getState());
  }, [visible, getState, editor.selection]);

  const onClick = useCallback(() => {
    const { selection } = editor;

    if (!selection) return;

    const isActivated = CustomEditor.isMarkActive(editor, EditorMarkFormat.Formula);

    if (!isActivated) {
      const text = editor.string(selection);

      editor.delete();

      editor.insertText('$');

      const newSelection = editor.selection;

      if (!newSelection) {
        console.error('newSelection is undefined');
        return;
      }

      Transforms.select(editor, {
        anchor: {
          path: newSelection.anchor.path,
          offset: newSelection.anchor.offset - 1,
        },
        focus: newSelection.focus,
      });

      CustomEditor.addMark(editor, {
        key: EditorMarkFormat.Formula,
        value: text,
      });
    } else {
      const [entry] = editor.nodes({
        at: selection,
        match: (n) => !Editor.isEditor(n) && Text.isText(n) && n.formula !== undefined,
      });

      if (!entry) return;

      const [node, path] = entry;
      const formula = (node as Text).formula;

      if (!formula) return;
      editor.select(path);
      CustomEditor.removeMark(editor, EditorMarkFormat.Formula);
      editor.delete();
      editor.insertText(formula);
    }

    setState(getState());
  }, [editor, getState]);

  return (
    <ActionButton
      onClick={onClick}
      active={isActivated}
      disabled={!isActivated && (hasFormulaActivated || hasMentionActivated)}
      tooltip={t('document.plugins.createInlineMathEquation')}
    >
      <MathSvg className='h-4 w-4' />
    </ActionButton>
  );
}

export default Formula;
