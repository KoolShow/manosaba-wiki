import { useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

export const dialogBus = new EventTarget();

export const DialogProvider = () => {
  const [ dialog, setDialog ] = useState(null);

  const openHandler = (e) => {
    setDialog(e.detail);
  };

  const closeHandler = () => {
    setDialog(null);
  };

  useEffect(() => {
    dialogBus.addEventListener('open', openHandler);
    dialogBus.addEventListener('close', closeHandler);

    return () => {
      dialogBus.removeEventListener('open', openHandler);
      dialogBus.removeEventListener('close', closeHandler);
    }
  }, []);

  return createPortal(
    <>
      <div
        class={[
          'dialog-backdrop',
          'bg-gray-900/50',
          'transition-opacity',
          'duration-500',
          'ease-out',
          `${dialog ? 'opacity-100' : 'opacity-0'}`,
          `${dialog ? 'pointer-events-auto' : 'pointer-events-none'}`,
        ].join(' ')}
        onClick={closeHandler}
      />
      <div
        class={[
          'dialog',
          'border',
          'border-gray-700',
          'rounded-md',
          'bg-gray-900',
          'text-gray-64',
          'min-w-80',
          'max-w-4xl',
          `${dialog ? 'opacity-100' : 'opacity-0'}`,
          `${dialog ? 'pointer-events-auto' : 'pointer-events-none'}`,
          `${dialog ? 'open' : 'closed'}`
        ].join(' ')}
      >{dialog}</div>
    </>,
    document.body
  );
};
