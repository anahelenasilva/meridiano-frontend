import { toast as reactToastify, ToastOptions } from 'react-toastify';

// Default toast options
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast utility wrapper
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    reactToastify.success(message, { ...defaultOptions, ...options });
  },

  error: (message: string, options?: ToastOptions) => {
    reactToastify.error(message, { 
      ...defaultOptions, 
      autoClose: 5000, // Longer for errors
      ...options 
    });
  },

  info: (message: string, options?: ToastOptions) => {
    reactToastify.info(message, { ...defaultOptions, ...options });
  },

  warning: (message: string, options?: ToastOptions) => {
    reactToastify.warning(message, { ...defaultOptions, ...options });
  },
};

