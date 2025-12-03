import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  columnCount?: number
  rowCount?: number
}

export function TableSkeleton({
  columnCount = 5,
  rowCount = 10,
}: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] overflow-hidden">
      <Table className="border-0">
        <TableHeader className="bg-gray-50/50 dark:bg-white/5">
          <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-white/10">
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i} className="h-12">
                <Skeleton className="h-4 w-full max-w-[120px] bg-gray-200 dark:bg-white/10" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent border-gray-100 dark:border-white/5">
              {Array.from({ length: columnCount }).map((_, j) => (
                <TableCell key={j} className="py-4">
                  <Skeleton className="h-4 w-full bg-gray-100 dark:bg-white/5" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}









