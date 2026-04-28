import { useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

export const dialogBus = new EventTarget();

export const DialogProvider = () => {
  const [ dialog, setDialog ] = useState(null);

  useEffect(() => {
    const openHandler = (e) => setDialog(e.detail);
    const closeHandler = () => setDialog(null);

    dialogBus.addEventListener('open', openHandler);
    dialogBus.addEventListener('close', closeHandler);

    return () => {
      dialogBus.removeEventListener('open', openHandler);
      dialogBus.removeEventListener('close', closeHandler);
    }
  }, []);

  if (!dialog) return null;

  return createPortal(
    <div class="dialog-backdrop">
      <div class="dialog">{dialog}</div>
    </div>,
    document.body
  );
};
