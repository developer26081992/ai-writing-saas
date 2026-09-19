"use client";

import { useEffect, useState } from "react";
import * as Y from "yjs";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import AIAssistant from "./AIAssistant";

export default function Editor() {
  const [ydoc] = useState(() => new Y.Doc());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const provider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: "ai-writing-document",
      document: ydoc,

      onConnect() {
        setConnected(true);
      },

      onDisconnect() {
        setConnected(false);
      },
    });

    return () => {
      provider.destroy();
    };
  }, [ydoc]);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),

      Collaboration.configure({
        document: ydoc,
      }),
    ],

    editorProps: {
      attributes: {
        class: "min-h-[200px] p-4 outline-none cursor-text",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(true);
    }
  }, [editor]);

  function insertAIText(text: string) {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertContent(`<p>${text.replace(/\n/g, "</p><p>")}</p>`)
      .run();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="rounded-lg border p-4">
        <p className="mb-4">
          Editor: {editor ? "READY" : "NOT READY"}
        </p>

        <p className="mb-4">
          Collaboration:{" "}
          {connected ? "CONNECTED" : "CONNECTING..."}
        </p>

        <div
          onClick={() => editor?.commands.focus()}
          className="min-h-[200px] cursor-text border p-4"
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <AIAssistant onInsert={insertAIText} />
    </div>
  );
}