import type { Editor } from "@tiptap/core";

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur: () => void;
  inputRef?: (element: HTMLElement | null) => void;
  disabled?: boolean;
  invalid?: boolean;
};

export type EditorSurfaceProps = {
  editor: Editor;
  disabled: boolean;
  invalid: boolean;
};
