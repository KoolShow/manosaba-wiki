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
        class={`dialog-backdrop bg-gray-800/50 transition-opacity duration-500 ease-out ${dialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeHandler}
      />
      <div class={`dialog bg-gray-800 text-gray-100 ${dialog ? 'open' : 'closed'}`}>{dialog}</div>
    </>,
    document.body
  );
};
