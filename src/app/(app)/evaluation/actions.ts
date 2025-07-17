"use server"

import { moderateTeacherEvaluation } from "@/ai/flows/moderate-teacher-evaluation"
import { z } from "zod"

const evaluationSchema = z.object({
  teacherId: z.string(),
  evaluationText: z.string(),
})

type State = {
  message: string
  isFlagged: boolean
  flaggingReasons: string[] | null
  isSuccess: boolean
}

export async function submitEvaluation(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = evaluationSchema.safeParse({
    teacherId: formData.get("teacherId"),
    evaluationText: formData.get("evaluationText"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      isFlagged: false,
      flaggingReasons: null,
      isSuccess: false,
    }
  }

  const { evaluationText } = validatedFields.data

  try {
    const moderationResult = await moderateTeacherEvaluation({
      evaluationText,
    })

    if (moderationResult.isFlagged) {
      return {
        message: "Evaluation flagged for inappropriate content.",
        isFlagged: true,
        flaggingReasons: moderationResult.flaggingReasons,
        isSuccess: false,
      }
    }

    // Here you would typically save the evaluation to your database
    console.log("Evaluation submitted:", validatedFields.data)

    return {
      message: "Evaluation submitted successfully.",
      isFlagged: false,
      flaggingReasons: null,
      isSuccess: true,
    }
  } catch (error) {
    console.error("Error during evaluation submission:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      isFlagged: false,
      flaggingReasons: null,
      isSuccess: false,
    }
  }
}
