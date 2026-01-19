import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
export function ComingSoonMinimal() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
      <Badge variant="outline" className="gap-1.5 mb-4">
        <Clock className="h-3 w-3" />
        Coming Soon
      </Badge>
      <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        This feature is being built. Stay tuned!
      </p>
    </div>
  )
}