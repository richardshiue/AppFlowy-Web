import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { EditorMarkFormat } from '@/application/slate-yjs/types';
import { Mention, MentionType, View, ViewLayout } from '@/application/types';
import { flattenViews } from '@/components/_shared/outline/utils';
import { usePanelContext } from '@/components/editor/components/panels/Panels.hooks';
import { PanelType } from '@/components/editor/components/panels/PanelsContext';
import { useEditorContext } from '@/components/editor/EditorContext';
import { Button, Divider } from '@mui/material';
import { PopoverOrigin } from '@mui/material/Popover/Popover';
import { sortBy, uniqBy } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { ReactComponent as AddIcon } from '@/assets/icons/plus.svg';
import { ReactComponent as ArrowIcon } from '@/assets/icons/forward_arrow.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { calculateOptimalOrigins, Popover } from '@/components/_shared/popover';
import dayjs from 'dayjs';
import PageIcon from '@/components/_shared/view-icon/PageIcon';

enum MentionTag {
  Reminder = 'reminder',
  User = 'user',
  Page = 'page',
  LoadMore = 'loadMore',
  NewPage = 'newPage',
  Date = 'date',
}

interface Option {
  category: MentionTag;
  index: number;
}

function createMentionOptions({
  showMore,
  viewsLength,
  dateLength,
  newPageLength,
}: {
  showMore: boolean;
  viewsLength: number;
  dateLength: number;
  newPageLength: number;
}) {
  const options = [
    ...Array(viewsLength).fill(0).map((_, index) => ({
      category: MentionTag.Page,
      index,
    })),
    showMore && {
      category: MentionTag.LoadMore,
      index: 0,
    },
    ...Array(dateLength).fill(0).map((_, index) => ({
      category: MentionTag.Date,
      index,
    })),
    ...Array(newPageLength).fill(0).map((_, index) => ({
      category: MentionTag.NewPage,
      index,
    })),
  ].filter(Boolean) as Option[];

  return options;
}

export function MentionPanel() {
  const {
    isPanelOpen,
    panelPosition,
    closePanel,
    searchText,
    removeContent,
    activePanel,
  } = usePanelContext();
  const showDate = activePanel === PanelType.Mention;
  const {
    viewId,
    loadViews,
    addPage,
    openPageModal,
  } = useEditorContext();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const open = useMemo(() => {
    return isPanelOpen(PanelType.Mention) || isPanelOpen(PanelType.PageReference);
  }, [isPanelOpen]);
  const selectedOptionRef = React.useRef<Option | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);
  const editor = useSlateStatic() as YjsEditor;
  const [moreCount, setMoreCount] = useState<number>(5);
  const [views, setViews] = useState<View[]>([]);

  useEffect(() => {
    if(!open) {
      selectedOptionRef.current = null;
      setSelectedOption(null);
      setMoreCount(5);
    }
  }, [open]);

  useEffect(() => {
    if(!open || !loadViews) return;

    void (async() => {
      try {
        const views = await loadViews();
        const result = sortBy(uniqBy(flattenViews(views || []).filter(view => !view.extra?.is_space), 'view_id'), 'last_edited_time').reverse();

        setViews(result);
      } catch(e) {
        console.error(e);
      }

    })();
  }, [loadViews, open]);

  const filteredViews = useMemo(() => {
    return views.filter(view => {
      if(!searchText) return true;
      return view.name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [searchText, views]);

  const splicedViews = useMemo(() => {
    return filteredViews.slice(0, moreCount);
  }, [filteredViews, moreCount]);

  const showMore = moreCount < filteredViews.length;

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
    if(!selectedOption) return;
    const {
      category,
      index,
    } = selectedOption;

    const el = ref.current?.querySelector(`[data-option-category="${category}"] [data-option-index="${index}"]`) as HTMLButtonElement | null;

    el?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [selectedOption]);

  const handleAddMention = useCallback((mention: Mention) => {
    removeContent();
    closePanel();
    editor.flushLocalChanges();

    editor.insertText('@');

    const newSelection = editor.selection;

    if(!newSelection) {
      console.error('newSelection is undefined');
      return;
    }

    const start = {
      path: newSelection.anchor.path,
      offset: newSelection.anchor.offset - 1,
    };

    Transforms.select(editor, {
      anchor: start,
      focus: newSelection.focus,
    });
    CustomEditor.addMark(editor, {
      key: EditorMarkFormat.Mention,
      value: mention,
    });

    Transforms.collapse(editor, {
      edge: 'end',
    });
  }, [closePanel, removeContent, editor]);

  const handleSelectedPage = useCallback((viewId: string, type = MentionType.PageRef) => {
    handleAddMention({
      page_id: viewId,
      type,
    });
  }, [handleAddMention]);

  const handleAddPage = useCallback(async(type = MentionType.PageRef) => {
    if(!addPage || !viewId) return;
    try {
      const newViewId = await addPage(viewId, { name: searchText, layout: ViewLayout.Document });

      handleSelectedPage(newViewId, type);
      openPageModal?.(newViewId);
    } catch(e) {
      console.error(e);
    }
  }, [addPage, searchText, handleSelectedPage, viewId, openPageModal]);
  const dateOptions = useMemo(() => {
    if(!showDate) return [];
    const onClick = (value: string) => {
      let date: string | undefined;

      switch(value) {
        case 'today':
          date = dayjs().toISOString();
          break;
        case 'tomorrow':
          date = dayjs().add(1, 'day').toISOString();
          break;
        case 'yesterday':
          date = dayjs().subtract(1, 'day').toISOString();
          break;
        default:
          break;
      }

      if(!date) return;

      handleAddMention({
        date,
        type: MentionType.Date,
      });

    };

    return [
      {
        name: t('relativeDates.today'),
        value: 'today',
        onClick: () => onClick('today'),
      },
      {
        name: t('relativeDates.tomorrow'),
        value: 'tomorrow',
        onClick: () => onClick('tomorrow'),
      },
      {
        name: t('relativeDates.yesterday'),
        value: 'yesterday',
        onClick: () => onClick('yesterday'),
      },
    ].filter(option => searchText ? option.name.toLowerCase().includes(searchText.toLowerCase()) : true);
  }, [handleAddMention, t, showDate, searchText]);

  const handleClickMore = useCallback(() => {
    setMoreCount(moreCount + 5);

    setSelectedOption(prev => {
      if(!prev) return null;
      return {
        category: MentionTag.Page,
        index: moreCount,
      };
    });
  }, [moreCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(!open) return;
      const { key } = e;

      switch(key) {
        case 'Enter':
          e.preventDefault();
          if(selectedOptionRef.current) {
            const index = selectedOptionRef.current.index;

            if(selectedOptionRef.current.category === MentionTag.NewPage) {
              void handleAddPage(index === 0 ? MentionType.childPage : MentionType.PageRef);
            } else if(selectedOptionRef.current.category === MentionTag.Page) {
              const viewId = splicedViews[index].view_id;

              handleSelectedPage(viewId, MentionType.PageRef);
            } else if(selectedOptionRef.current.category === MentionTag.Date) {

              dateOptions[index].onClick();
            } else if(selectedOptionRef.current.category === MentionTag.LoadMore) {
              handleClickMore();
            }
          }

          break;
        case 'ArrowUp':
        case 'ArrowDown': {
          e.stopPropagation();
          e.preventDefault();
          const options = createMentionOptions({
            viewsLength: splicedViews.length,
            dateLength: dateOptions.length,
            newPageLength: 2,
            showMore,
          });

          if(!selectedOptionRef.current) {
            if(e.key === 'ArrowDown') {
              setSelectedOption(options[0]);
            } else {
              setSelectedOption(options[options.length - 1]);
            }

            break;
          }

          const { category, index } = selectedOptionRef.current;
          const currentIndex = options.findIndex(option => option.category === category && option.index === index);
          const nextIndex = e.key === 'ArrowDown' ? (currentIndex + 1) % options.length : (currentIndex - 1 + options.length) % options.length;

          setSelectedOption(options[nextIndex]);

          break;
        }

        default:
          break;
      }

    };

    const slateDom = ReactEditor.toDOMNode(editor, editor);

    slateDom.addEventListener('keydown', handleKeyDown);

    return () => {
      slateDom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, handleClickMore, handleAddPage, handleSelectedPage, open, selectedOptionRef, splicedViews, dateOptions, showMore]);
  const [transformOrigin, setTransformOrigin] = React.useState<PopoverOrigin | undefined>(undefined);

  useEffect(() => {
    if(open && panelPosition) {
      const origins = calculateOptimalOrigins(panelPosition, 320, 560, undefined, 16);
      const isAlignBottom = origins.transformOrigin.vertical === 'bottom';

      setTransformOrigin(isAlignBottom ? origins.transformOrigin : {
        vertical: -30,
        horizontal: origins.transformOrigin.horizontal,
      });
    }
  }, [open, panelPosition]);

  return (
    <Popover
      adjustOrigins={false}
      data-testid={'mention-panel'}
      open={open}
      onClose={closePanel}
      anchorReference={'anchorPosition'}
      anchorPosition={panelPosition}
      disableAutoFocus={true}
      disableRestoreFocus={true}
      disableEnforceFocus={true}
      transformOrigin={transformOrigin}
      onMouseDown={e => e.preventDefault()}
    >
      <div
        ref={ref}
        className={'flex relative w-[320px] flex-col gap-2 max-h-[560px] p-2 appflowy-scroller overflow-y-auto'}
      >
        <div className={'text-text-caption scroll-my-10 px-1'}>{t('inlineActions.recentPages')}</div>
        <div
          data-option-category={MentionTag.Page}
          className={'flex flex-col gap-2'}
        >
          {splicedViews && splicedViews.length > 0 ? (
              <div className={'flex w-full flex-col gap-2'}>
                {splicedViews.map((view, index) => (
                  <Button
                    color={'inherit'}
                    size={'small'}
                    key={view.view_id}
                    data-option-index={index}
                    startIcon={
                      <PageIcon
                        view={view}
                        className={'flex h-5 w-5 min-w-5 items-center justify-center'}
                      />
                    }
                    className={`justify-start truncate scroll-m-2 min-h-[32px] hover:bg-fill-list-hover ${selectedOption?.index === index && selectedOption?.category === MentionTag.Page ? 'bg-fill-list-hover' : ''}`}
                    onClick={() => handleSelectedPage(view.view_id)}
                  >
                    {view.name || t('menuAppHeader.defaultNewPageName')}
                  </Button>
                ))}
              </div>
            ) :
            <div
              className={'text-text-caption text-sm flex justify-center items-center p-2'}
            >{t('findAndReplace.noResult')}</div>
          }
          {showMore &&
            <div
              data-option-category={MentionTag.LoadMore}
              className={'w-full'}
            >
              <Button
                color={'inherit'}
                size={'small'}
                data-option-index={0}
                startIcon={<MoreIcon />}
                className={`justify-start w-full scroll-m-2 min-h-[32px] hover:bg-fill-list-hover ${selectedOption?.index === 0 && selectedOption?.category === MentionTag.LoadMore ? 'bg-fill-list-hover' : ''}`}
                onClick={handleClickMore}
              >
                {filteredViews.length - moreCount} {t('document.mention.morePages')}
              </Button>
            </div>
          }
        </div>
        {showDate && <div
          className={'flex flex-col gap-2'}
          data-option-category={MentionTag.Date}
        >
          <div className={'text-text-caption scroll-my-10 px-1'}>{t('inlineActions.date')}</div>
          {
            dateOptions.map((option, index) => (
              <Button
                key={option.value}
                color={'inherit'}
                size={'small'}
                data-option-index={index}
                className={`justify-start scroll-m-2 min-h-[32px] hover:bg-fill-list-hover ${
                  selectedOption?.index === index && selectedOption?.category === MentionTag.Date ? 'bg-fill-list-hover' : ''
                }`}
                onClick={option.onClick}
              >
                {option.name}
              </Button>
            ))
          }

        </div>}

        <div
          data-option-category={MentionTag.NewPage}
          className={'flex w-full flex-col gap-2'}
        >
          <Divider />
          <Button
            color={'inherit'}
            startIcon={<AddIcon />}
            size={'small'}
            data-option-index={0}
            className={`justify-start scroll-m-2 min-h-[32px] hover:bg-fill-list-hover ${selectedOption?.index === 0 && selectedOption?.category === MentionTag.NewPage ? 'bg-fill-list-hover' : ''}`}
            onClick={() => {
              setSelectedOption({
                category: MentionTag.NewPage,
                index: 0,
              });
              void handleAddPage(MentionType.childPage);
            }}
          >
            <span>{t('button.create')}</span>
            <span className={'mx-1'}>{searchText ? `"${searchText}"` : 'new'}</span>
            <span>{t('document.slashMenu.subPage.keyword1')}</span>
          </Button>

          <Button
            color={'inherit'}
            startIcon={<ArrowIcon className={'mx-0.5'} />}
            size={'small'}
            data-option-index={1}
            className={`justify-start scroll-m-2 min-h-[32px] hover:bg-fill-list-hover ${selectedOption?.index === 1 && selectedOption?.category === MentionTag.NewPage ? 'bg-fill-list-hover' : ''}`}
            onClick={() => {
              setSelectedOption({
                category: MentionTag.NewPage,
                index: 1,
              });
              void handleAddPage(MentionType.PageRef);
            }}
          >
            <span>{t('button.create')}</span>
            <span className={'mx-1'}>{searchText ? `"${searchText}"` : 'new'}</span>
            <span>page in...</span>
          </Button>
        </div>
      </div>
    </Popover>
  );
}

export default MentionPanel;