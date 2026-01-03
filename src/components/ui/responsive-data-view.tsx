"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Column definition for the table
export interface DataColumn<T> {
  key: string
  header: string
  // Render function for table cell
  cell: (item: T) => React.ReactNode
  // Optional: hide on mobile cards (will still show in table)
  hideOnMobile?: boolean
  // Optional: className for the cell
  className?: string
}

// Props for mobile card rendering
export interface MobileCardProps<T> {
  item: T
  renderContent: (item: T) => React.ReactNode
  renderActions?: (item: T) => React.ReactNode
}

interface ResponsiveDataViewProps<T> {
  data: T[]
  columns: DataColumn<T>[]
  // Unique key extractor for each item
  keyExtractor: (item: T) => string | number
  // Custom mobile card renderer
  renderMobileCard: (item: T) => React.ReactNode
  // Optional: max height for scroll area (desktop)
  maxHeight?: string
  // Optional: empty state message
  emptyMessage?: string
  // Optional: className for container
  className?: string
}

export function ResponsiveDataView<T>({
  data,
  columns,
  keyExtractor,
  renderMobileCard,
  maxHeight = "400px",
  emptyMessage = "No se encontraron registros",
  className
}: ResponsiveDataViewProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Mobile View - Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((item) => (
          <React.Fragment key={keyExtractor(item)}>
            {renderMobileCard(item)}
          </React.Fragment>
        ))}
      </div>

      {/* Desktop View - Table */}
      <ScrollArea 
        className="hidden md:block h-auto rounded-md border" 
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

// Helper component for mobile cards
interface DataCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function DataCard({ children, actions, className }: DataCardProps) {
  return (
    <Card className={cn("w-full rounded-xl", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {children}
          {actions && (
            <div className="pt-2 border-t border-slate-100">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper component for card field display
interface DataFieldProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function DataField({ label, value, className }: DataFieldProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
