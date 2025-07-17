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
        Teacher Evaluation
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Feedback</CardTitle>
          <CardDescription>
            Your feedback is valuable for improving the quality of teaching.
            Please be honest and constructive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationForm />
        </CardContent>
      </Card>
    </div>
  );
}
