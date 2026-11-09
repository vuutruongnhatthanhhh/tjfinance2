import Skeleton from "@/components/Skeleton";

export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-5xl md:px-10 md:pt-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>
      <Skeleton className="h-48 rounded-3xl" />
    </div>
  );
}
