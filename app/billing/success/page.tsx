export default function BillingSuccessPage() {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">
            Subscription Successful
          </h1>
  
          <p className="mb-6">
            Your subscription has been successfully created.
          </p>
  
          <a
            href="/"
            className="inline-block rounded bg-black px-4 py-2 text-white"
          >
            Return to Editor
          </a>
        </div>
      </main>
    );
  }