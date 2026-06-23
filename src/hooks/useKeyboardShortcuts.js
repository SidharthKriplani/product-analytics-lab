import { useEffect } from 'react';

/**
 * useKeyboardShortcuts — attach global keyboard shortcuts.
 * Skips if focus is on an input, textarea, or select element.
 *
 * @param {Array<{ key: string, ctrlKey?: boolean, action: () => void }>} shortcuts
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    function handleKeyDown(e) {
      // Skip when typing in a form element OR a contenteditable surface
      // (CodeMirror's editor is a contenteditable div, not a <textarea>).
      const ae = document.activeElement;
      const tag = ae?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || ae?.isContentEditable) return;

      for (const shortcut of shortcuts) {
        const keyMatches = e.key === shortcut.key;
        const ctrlMatches = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : true;
        const noUnwantedCtrl = shortcut.ctrlKey ? true : !e.ctrlKey && !e.metaKey && !e.altKey;

        if (keyMatches && ctrlMatches && noUnwantedCtrl) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
