import { getRedirectTo } from '@/application/session/sign_in';
import { NormalModal } from '@/components/_shared/modal';
import { AFConfigContext } from '@/components/main/app.hooks';
import LinearBuffer from '@/components/login/LinearBuffer';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as ErrorIcon } from '@/assets/icons/error.svg';

function LoginAuth() {
  const service = useContext(AFConfigContext)?.service;
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const openLoginModal = useContext(AFConfigContext)?.openLoginModal;

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await service?.loginAuth(window.location.href);
        // eslint-disable-next-line
      } catch (e: any) {
        setError(e.message);
        setModalOpened(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [service]);
  const navigate = useNavigate();

  return (
    <>
      {loading ? (
        <div className={'flex h-screen w-screen items-center justify-center p-20'}>
          <LinearBuffer />
        </div>
      ) : null}
      <NormalModal
        PaperProps={{
          sx: {
            minWidth: 400,
          },
        }}
        onCancel={() => {
          setModalOpened(false);
          navigate('/');
        }}
        closable={false}
        cancelText={t('button.backToHome')}
        onOk={() => {
          openLoginModal?.(getRedirectTo() || `${window.location.origin}/app`);
        }}
        okText={t('button.tryAgain')}
        title={
          <div className={'flex items-center gap-2 text-left font-bold'}>
            <ErrorIcon className={'h-5 w-5 text-function-error'} />
            Login failed
          </div>
        }
        open={modalOpened}
      >
        <div className={'flex flex-col gap-1 whitespace-pre-wrap break-words text-sm text-text-title'}>{error}</div>
      </NormalModal>
    </>
  );
}

export default LoginAuth;
