import { Suspense } from "react";
import { redirect } from "next/navigation";
import SearchContent from "./SearchContent";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  if (!searchParams.q) {
    redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
