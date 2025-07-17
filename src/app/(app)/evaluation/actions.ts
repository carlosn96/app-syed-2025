"use server"

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

// Simula la moderación sin llamar a una API
async function moderateTeacherEvaluation(input: {
  evaluationText: string
}): Promise<{ isFlagged: boolean; flaggingReasons: string[] }> {
  console.log(
    "Simulando moderación para:",
    input.evaluationText.substring(0, 30) + "..."
  )
  // En un caso de uso real, aquí podría haber lógica de negocio
  // Por ahora, aprobamos todas las evaluaciones
  return Promise.resolve({ isFlagged: false, flaggingReasons: [] })
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
      message: "Datos de formulario inválidos.",
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
        message: "Evaluación marcada por contenido inapropiado.",
        isFlagged: true,
        flaggingReasons: moderationResult.flaggingReasons,
        isSuccess: false,
      }
    }

    // Aquí normalmente guardarías la evaluación en tu base de datos
    console.log("Evaluación enviada:", validatedFields.data)

    return {
      message: "Evaluación enviada con éxito.",
      isFlagged: false,
      flaggingReasons: null,
      isSuccess: true,
    }
  } catch (error) {
    console.error("Error durante el envío de la evaluación:", error)
    return {
      message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
      isFlagged: false,
      flaggingReasons: null,
      isSuccess: false,
    }
  }
}
