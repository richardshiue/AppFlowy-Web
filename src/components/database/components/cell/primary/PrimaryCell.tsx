import { useDatabaseContext, useDatabaseViewId, useRowMetaSelector } from '@/application/database-yjs';
import { TextCell as CellType, CellProps } from '@/application/database-yjs/cell.type';
import { TextCell } from '@/components/database/components/cell/text';
import OpenAction from '@/components/database/components/database-row/OpenAction';
import { getPlatform } from '@/utils/platform';
import React, { useEffect, useMemo, useState } from 'react';
import { ReactComponent as DocumentSvg } from '@/assets/icons/doc.svg';

export function PrimaryCell(
  props: CellProps<CellType> & {
    showDocumentIcon?: boolean;
  }
) {
  const { rowId, showDocumentIcon } = props;
  const meta = useRowMetaSelector(rowId);
  const navigateToRow = useDatabaseContext().navigateToRow;
  const hasDocument = meta?.isEmptyDocument === false;
  const icon = meta?.icon;
  const viewId = useDatabaseViewId();

  const [hover, setHover] = useState(false);

  useEffect(() => {
    const table = document.querySelector(`.grid-table-${viewId}`);

    if (!table) {
      return;
    }

    const onMouseMove = (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('.grid-row-cell')?.getAttribute('data-row-id') === rowId) {
        setHover(true);
      } else {
        setHover(false);
      }
    };

    const onMouseLeave = () => {
      setHover(false);
    };

    table.addEventListener('mousemove', onMouseMove);
    table.addEventListener('mouseleave', onMouseLeave);
    return () => {
      table.removeEventListener('mousemove', onMouseMove);
      table.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [rowId, viewId]);

  const isMobile = useMemo(() => {
    return getPlatform()?.isMobile;
  }, []);

  return (
    <div
      onClick={() => {
        if (isMobile) {
          navigateToRow?.(rowId);
        }
      }}
      className={'primary-cell relative flex min-h-full w-full gap-2'}
    >
      {icon ? (
        <div className={'flex h-5 w-5 items-center justify-center text-base'}>{icon}</div>
      ) : hasDocument && showDocumentIcon ? (
        <DocumentSvg className={'h-5 w-5'} />
      ) : null}
      <div className={'flex-1 overflow-x-hidden'}>
        <TextCell {...props} />
      </div>

      {hover && navigateToRow && (
        <div className={'absolute right-0 top-1/2 min-w-0 -translate-y-1/2 transform '}>
          <OpenAction rowId={rowId} />
        </div>
      )}
    </div>
  );
}

export default PrimaryCell;
