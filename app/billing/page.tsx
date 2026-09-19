"use client";

import { useState } from "react";
import { Plan } from "@prisma/client";
import { createCheckoutSession } from "@/app/actions/stripe";

export default function BillingPage() {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [message, setMessage] = useState("");

  async function subscribe(plan: Plan) {
    setLoading(plan);
    setMessage("");

    try {
      const result = await createCheckoutSession(
        "demo-org-1",
        plan
      );

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to start checkout.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">
          Choose Your Plan
        </h1>

        <p className="mb-8 text-gray-600">
          Upgrade your AI Writing SaaS subscription.
        </p>

        {message && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-bold">FREE</h2>

            <p className="my-4 text-2xl font-bold">$0</p>

            <ul className="mb-6 space-y-2 text-sm">
              <li>✓ 10 AI generations/month</li>
              <li>✓ 5 documents</li>
              <li>✓ Collaborative editing</li>
            </ul>

            <button
              disabled
              className="w-full rounded bg-gray-200 px-4 py-2 text-gray-600"
            >
              Current Plan
            </button>
          </div>

          <div className="rounded-lg border-2 border-blue-500 p-6">
            <h2 className="text-xl font-bold">PRO</h2>

            <p className="my-4 text-2xl font-bold">
              Subscription
            </p>

            <ul className="mb-6 space-y-2 text-sm">
              <li>✓ 500 AI generations/month</li>
              <li>✓ Unlimited documents</li>
              <li>✓ Collaborative editing</li>
            </ul>

            <button
              onClick={() => subscribe(Plan.PRO)}
              disabled={loading !== null}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading === Plan.PRO
                ? "Loading..."
                : "Upgrade to PRO"}
            </button>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-bold">ENTERPRISE</h2>

            <p className="my-4 text-2xl font-bold">
              Subscription
            </p>

            <ul className="mb-6 space-y-2 text-sm">
              <li>✓ Unlimited AI generations</li>
              <li>✓ Unlimited documents</li>
              <li>✓ Collaborative editing</li>
            </ul>

            <button
              onClick={() => subscribe(Plan.ENTERPRISE)}
              disabled={loading !== null}
              className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading === Plan.ENTERPRISE
                ? "Loading..."
                : "Upgrade to ENTERPRISE"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}