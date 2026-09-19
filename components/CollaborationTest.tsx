"use client";

import { useEffect, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

export default function CollaborationTest() {
  const [status, setStatus] = useState("CONNECTING...");

  useEffect(() => {
    const ydoc = new Y.Doc();

    const provider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: "test-room",
      document: ydoc,
      onConnect() {
        setStatus("CONNECTED");
      },
      onDisconnect() {
        setStatus("DISCONNECTED");
      },
    });

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  return (
    <div className="mt-4 rounded-lg border p-4">
      <p>Collaboration test: {status}</p>
    </div>
  );
}