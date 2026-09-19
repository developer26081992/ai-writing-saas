export default function BillingCancelPage() {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">
            Checkout Cancelled
          </h1>
  
          <p className="mb-6">
            Your subscription checkout was cancelled.
          </p>
  
          <a
            href="/billing"
            className="inline-block rounded bg-black px-4 py-2 text-white"
          >
            Return to Billing
          </a>
        </div>
      </main>
    );
  }