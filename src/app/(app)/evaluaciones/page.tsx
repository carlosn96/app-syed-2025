
"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { evaluationPeriods } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEvaluationPeriodForm } from "@/components/create-evaluation-period-form"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EvaluationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Programar Evaluaciones
        </h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Programar Período
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Programar Período de Evaluación</DialogTitle>
              <DialogDescription>
                Define un período para que un grupo evalúe a un docente.
              </DialogDescription>
            </DialogHeader>
            <CreateEvaluationPeriodForm onSuccess={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        className="p-3 w-full"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4 w-full",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex justify-around",
                            row: "flex w-full mt-2 justify-around",
                        }}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Períodos Programados</CardTitle>
                    <CardDescription>Períodos de evaluación activos y futuros.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {evaluationPeriods.map((period) => (
                        <div key={period.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-md h-12 w-12 text-sm">
                                <span>{format(period.startDate, "LLL", { locale: es })}</span>
                                <span className="font-bold text-lg">{period.startDate.getDate()}</span>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                    {period.group} - {period.teacher}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {period.subject}
                                </p>
                                 <p className="text-xs text-muted-foreground">
                                    Finaliza: {format(period.endDate, "PPP", { locale: es })}
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
