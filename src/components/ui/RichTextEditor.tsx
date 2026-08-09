import { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, List, Link as LinkIcon } from 'lucide-react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, disabled, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  // Keep the DOM in sync when the value changes from outside (switching
  // sections, discarding edits) — but never while the admin is actively
  // typing, or the cursor would jump to the start on every keystroke.
  useEffect(() => {
    if (ref.current && !focused.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const addLink = () => {
    const url = window.prompt('Link URL (e.g. https://wa.me/256701924517)');
    if (url) exec('createLink', url);
  };

  // Paste as plain text only — otherwise pasted HTML (formatting, and in the
  // worst case a stray <script>) would land straight in content shown to
  // every site visitor. The admin can re-apply bold/italic afterward.
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    emitChange();
  };

  return (
    <div className={`richtext-field ${disabled ? 'richtext-field--disabled' : ''}`}>
      <div className="richtext-toolbar">
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => exec('bold')} title="Bold" disabled={disabled}><Bold size={14} /></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => exec('italic')} title="Italic" disabled={disabled}><Italic size={14} /></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => exec('underline')} title="Underline" disabled={disabled}><UnderlineIcon size={14} /></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => exec('insertUnorderedList')} title="Bullet list" disabled={disabled}><List size={14} /></button>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={addLink} title="Link" disabled={disabled}><LinkIcon size={14} /></button>
      </div>
      <div
        ref={ref}
        className="richtext-editable"
        contentEditable={!disabled}
        data-placeholder={placeholder}
        onInput={emitChange}
        onPaste={handlePaste}
        onFocus={() => { focused.current = true; }}
        onBlur={() => { focused.current = false; }}
        suppressContentEditableWarning
      />
    </div>
  );
}
