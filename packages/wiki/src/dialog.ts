import { dialogBus } from './providers/dialog';
import type { ComponentChild } from 'preact';

export const show = (content: ComponentChild) => {
  dialogBus.dispatchEvent(new CustomEvent('open', { detail: content }));
};

export const hide = () => {
  dialogBus.dispatchEvent(new CustomEvent('close'));
}
