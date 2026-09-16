export default function Loading() {
  return (
    <div className="min-h-screen bg-agro-branco dark:bg-gray-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
            <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>

      {/* Analytics & Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="h-5 w-44 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-64 w-full bg-gray-100 dark:bg-gray-800/60 rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-64 w-full bg-gray-100 dark:bg-gray-800/60 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
