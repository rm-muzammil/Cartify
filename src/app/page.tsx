import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-zinc-900 px-4">

      <h1 className="text-5xl font-bold mb-4">
        Copify — Build Your Online Store Faster 🚀
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
        Create your own e-commerce store, manage products, track orders, and grow with built-in analytics.
      </p>

      <div className="flex gap-4">
        <Link href="/register" className="btn-primary">
          Get Started
        </Link>

        <Link href="/login" className="btn-secondary">
          Login
        </Link>
      </div>

    </main>
  );
}
