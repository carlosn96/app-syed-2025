import { EvaluationForm } from "@/components/evaluation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EvaluationPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Evaluación de Docentes
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Envía tus Comentarios</CardTitle>
          <CardDescription>
            Tus comentarios son valiosos para mejorar la calidad de la enseñanza.
            Por favor, sé honesto y constructivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationForm />
        </CardContent>
      </Card>
    </div>
  );
}
