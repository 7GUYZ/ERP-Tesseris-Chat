import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function TiptapEditor({ value = "", onChange}) {
    const editor = useEditor({
        extensions: [StarterKit,Image,Link],
        content: value,
        editorProps: {
            attributes: {
                class: "tiptap-editor",
            },
        },
        onUpdate({ editor }) {
            // 내용이 바뀔때마다 onChange로 html 전달
            onChange && onChange(editor.getText());
        }
    });
    // 버튼 UI
    function Toolbar({ editor }) {
        if (!editor) return null;

        return (
            <div style={{ marginBottom: 8 }}>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "is-active" : ""}
                    type="button"
                >
                    <b>B</b>
                </button>
                <button onClick={()=>editor.chain().focus().setImage().run()}>
                    Image
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "is-active" : ""}
                    type="button"
                >
                    <i>I</i>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive("strike") ? "is-active" : ""}
                    type="button"
                >
                    <s>S</s>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "is-active" : ""}
                    type="button"
                >
                    ● List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "is-active" : ""}
                    type="button"
                >
                    1. List
                </button>
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    type="button"
                >
                    Undo
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    type="button"
                >
                    Redo
                </button>
            </div>
        );
    }

    return (
        <div>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}