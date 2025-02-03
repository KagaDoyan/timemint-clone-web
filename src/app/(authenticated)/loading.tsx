import { Skeleton } from "@/components/ui/skeleton";

function LoadingPage() {
    return (
        <div className="flex flex-col gap-4 p-4 max-w-full overflow-auto">
            <Skeleton className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 rounded-xl" />
            <div className="space-y-2 h-full">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="w-full h-full" />
            </div>
        </div>
    )
}

export default LoadingPage