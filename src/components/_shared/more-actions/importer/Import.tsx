import { NormalModal } from '@/components/_shared/modal';
import ImporterModal from '@/components/_shared/more-actions/importer/ImporterModal';
import { useImport } from '@/components/_shared/more-actions/importer/useImport.hook';
import { LoginModal } from '@/components/login';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CheckedIcon } from '@/assets/icons/check_circle.svg';

function Import({ disableClose, onSuccessfulImport }: { disableClose?: boolean; onSuccessfulImport?: () => void }) {
  const { open, handleImportClose, handleLoginClose, loginOpen, url, source } = useImport();
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const { t } = useTranslation();

  const handleSuccess = React.useCallback(() => {
    setOpenSuccess(true);
  }, []);

  return (
    <>
      <LoginModal redirectTo={url} open={loginOpen} onClose={handleLoginClose} />
      {open && (
        <ImporterModal
          open={open}
          disableClose={disableClose}
          source={source || undefined}
          onClose={handleImportClose}
          onSuccess={onSuccessfulImport || handleSuccess}
        />
      )}
      {openSuccess && (
        <NormalModal
          classes={{ container: 'items-start max-md:mt-auto max-md:items-center mt-[20%] ' }}
          title={
            <div className={'flex items-center gap-2 font-semibold'}>
              <CheckedIcon className={'h-4 w-4 text-function-success'} />
              {t('web.importSuccess')}
            </div>
          }
          open={openSuccess}
          onOk={() => {
            setOpenSuccess(false);
            handleImportClose();
          }}
          cancelButtonProps={{
            className: 'hidden',
          }}
          closable={false}
          onClose={() => setOpenSuccess(false)}
        >
          <div className='text-text-caption'>{t('web.importSuccessMessage')}</div>
        </NormalModal>
      )}
    </>
  );
}

export default Import;
