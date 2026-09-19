"use client";

import { useState } from "react";

type AIAssistantProps = {
  onInsert: (text: string) => void;
};

export default function AIAssistant({ onInsert }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const error = await res.text();
        setResponse(error);
        return;
      }

      const reader = res.body?.getReader();

      if (!reader) {
        setResponse("No response received.");
        return;
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        setResponse((current) => current + chunk);
      }
    } catch (error) {
      console.error(error);
      setResponse("AI generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="w-full rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-bold">
        AI Writing Assistant
      </h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AI to write something..."
        rows={5}
        className="mb-3 w-full rounded border p-3"
      />

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      <div className="mt-4 whitespace-pre-wrap rounded border p-3">
        {response || "AI response will appear here..."}
      </div>

      {response && !loading && (
        <button
          onClick={() => onInsert(response)}
          className="mt-3 rounded border px-4 py-2"
        >
          Insert into document
        </button>
      )}
    </aside>
  );
}