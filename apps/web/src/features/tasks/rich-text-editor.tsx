import { Button } from "@/components/ui/button";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cleanDescription } from "./description";
import type {
  EditorSurfaceProps,
  RichTextEditorProps,
} from "./types/rich-text-editor.types";

const extensions = [
  StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
];

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  inputRef,
  disabled = false,
  invalid = false,
}: RichTextEditorProps) {
  const [initialContent] = useState(() => cleanDescription(value));
  const editor = useEditor({
    extensions,
    content: initialContent,
    // A lazy/interruptible render can outlive Tiptap's eager-instance cleanup.
    // Create the editor after commit, not during a speculative React render.
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        id: "task-description",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": "task-description-label",
        "aria-describedby": "task-description-hint task-description-error",
        "aria-invalid": String(invalid),
        class: "rich-text-content",
      },
    },
    onUpdate: ({ editor }) => {
      if (!editor.isDestroyed) onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    onBlur,
  });
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.getHTML() !== value && !(editor.isEmpty && !value)) {
      editor.commands.setContent(cleanDescription(value), {
        emitUpdate: false,
      });
    }
  }, [editor, value]);
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled, false);
  }, [editor, disabled]);
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    inputRef?.(editor.view.dom);
    return () => inputRef?.(null);
  }, [editor, inputRef]);

  if (!editor || editor.isDestroyed)
    return <p role="status">Preparando editor…</p>;
  return (
    <EditorSurface
      key={editor.instanceId}
      editor={editor}
      disabled={disabled}
      invalid={invalid}
    />
  );
}

function EditorSurface({ editor, disabled, invalid }: EditorSurfaceProps) {
  // Subscribe only once a live editor exists. An initial null snapshot must not
  // gate EditorContent, which itself installs the editor's transaction plugins.
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      !editor.isDestroyed
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            heading: editor.isActive("heading", { level: 2 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            quote: editor.isActive("blockquote"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
            empty: editor.isEmpty,
          }
        : null,
  });
  if (!state || editor.isDestroyed) return null;

  const formats = [
    {
      label: "Negrita",
      Icon: Bold,
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Cursiva",
      Icon: Italic,
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Subrayado",
      Icon: Underline,
      active: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Tachado",
      Icon: Strikethrough,
      active: state.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Encabezado",
      Icon: Heading2,
      active: state.heading,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Lista con viñetas",
      Icon: List,
      active: state.bullet,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Lista numerada",
      Icon: ListOrdered,
      active: state.ordered,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Cita",
      Icon: Quote,
      active: state.quote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];
  return (
    <div
      className="rich-editor"
      data-empty={state.empty}
      data-invalid={invalid}
      data-disabled={disabled}
    >
      <div
        className="rich-editor-toolbar"
        role="group"
        aria-label="Formato de la descripción"
        onMouseDown={(event) => event.preventDefault()}
      >
        {formats.map(({ label, Icon, active, run }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            title={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={run}
          >
            <Icon size={16} aria-hidden="true" />
          </Button>
        ))}
        <span className="rich-editor-divider" aria-hidden="true" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Deshacer"
          title="Deshacer"
          disabled={disabled || !state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={16} aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Rehacer"
          title="Rehacer"
          disabled={disabled || !state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={16} aria-hidden="true" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
