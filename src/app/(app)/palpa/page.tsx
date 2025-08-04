
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PalpaPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
        Palpa
      </h1>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Bienvenido a Palpa</CardTitle>
          <CardDescription>
            Esta sección está en construcción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted rounded-xl">
            <p className="text-muted-foreground">Próximamente...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
