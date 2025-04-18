import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          M&A Dataroom
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A secure platform for managing due diligence processes during mergers and acquisitions. 
          Organize documents, collect information, and collaborate with your team in one place.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/auth/signin"
            className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm border border-blue-300 hover:bg-blue-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}