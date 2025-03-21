import { useEffect, useState } from 'react';

type KeyboardShortcuts = {
  [key: string]: () => void;
};

export default function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Create a key string that includes modifiers
      const key = [
        event.ctrlKey ? 'Ctrl+' : '',
        event.metaKey ? 'Meta+' : '',
        event.altKey ? 'Alt+' : '',
        event.shiftKey ? 'Shift+' : '',
        event.key,
      ].join('');

      // Check if we have a handler for this key combination
      const handler = shortcuts[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);

  return {
    enableShortcuts: () => setEnabled(true),
    disableShortcuts: () => setEnabled(false),
    isEnabled: enabled,
  };
}
