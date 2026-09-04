export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="mb-4 h-3 w-28 animate-pulse bg-muted" />
      <div className="mb-3 h-10 w-2/3 max-w-xl animate-pulse bg-muted" />
      <div className="h-4 w-full max-w-lg animate-pulse bg-muted" />
      <div className="mt-2 h-4 w-5/6 max-w-md animate-pulse bg-muted" />
    </div>
  );
}
