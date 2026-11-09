import Skeleton from "@/components/Skeleton";

export default function AuthLoading() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 ring-1 ring-border">
      <Skeleton className="h-11 rounded-xl" />
      <Skeleton className="h-11 rounded-xl" />
      <Skeleton className="h-11 rounded-xl" />
      <Skeleton className="h-12 rounded-2xl" />
    </div>
  );
}
