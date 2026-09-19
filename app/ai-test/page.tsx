"use client";

import { useState } from "react";

export default function AITest() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setResponse("");

    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      setResponse(await res.text());
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      setResponse("No response stream");
      setLoading(false);
      return;
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      setResponse((current) => current + decoder.decode(value));
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-bold">
        AI Test
      </h1>

      <textarea
        className="mb-4 w-full rounded border p-3"
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask the AI something..."
      />

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      <div className="mt-6 whitespace-pre-wrap rounded border p-4">
        {response || "AI response will appear here..."}
      </div>
    </main>
  );
}