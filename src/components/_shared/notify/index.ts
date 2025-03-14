import { InfoProps } from '@/components/_shared/notify/InfoSnackbar';
import React, { lazy } from 'react';

export const InfoSnackbar = lazy(() => import('./InfoSnackbar'));

export const notify = {
  success: (message: string | React.ReactNode) => {
    window.toast.success(message);
  },
  error: (message: string | React.ReactNode) => {
    window.toast.error(message);
  },
  default: (message: string | React.ReactNode) => {
    window.toast.default(message);
  },
  warning: (message: string | React.ReactNode) => {
    window.toast.warning(message);
  },
  info: (props: InfoProps) => {
    window.toast.info({
      ...props,
      variant: 'info',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    });
  },
  clear: () => {
    window.toast.clear();
  },
};

export * from './InfoSnackbar';
