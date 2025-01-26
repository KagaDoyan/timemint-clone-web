import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle 
            size={100} 
            className="text-destructive/70 stroke-[1.5]" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you are looking for might have been removed, 
          had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild size="lg">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
