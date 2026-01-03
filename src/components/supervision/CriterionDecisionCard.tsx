"use client"

import * as React from "react"
import { Check, X, MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { CriterionEvaluation } from "@/lib/supervision-types"

interface CriterionDecisionCardProps {
  criterio: {
    id: string | number
    texto: string
  }
  evaluation: CriterionEvaluation | undefined
  onDecision: (decision: 'cumplido' | 'no_cumplido') => void
  onComentarioChange: (comentario: string) => void
  className?: string
}

export function CriterionDecisionCard({
  criterio,
  evaluation,
  onDecision,
  onComentarioChange,
  className
}: CriterionDecisionCardProps) {
  const [showComment, setShowComment] = React.useState(
    !!evaluation?.comentario && evaluation.comentario.length > 0
  )
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const currentDecision = evaluation?.decision ?? null
  const currentComment = evaluation?.comentario ?? ''

  // Auto-expand textarea
  React.useEffect(() => {
    if (textareaRef.current && showComment) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [currentComment, showComment])

  // Focus textarea when shown
  React.useEffect(() => {
    if (showComment && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showComment])

  return (
    <div 
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-4 space-y-4",
        className
      )}
    >
      {/* Criterion Text */}
      <p className="text-base font-medium text-slate-900 leading-relaxed">
        {criterio.texto}
      </p>

      {/* Binary Decision Buttons */}
      <div className="flex flex-col gap-2">
        {/* Cumplido Button */}
        <button
          type="button"
          onClick={() => onDecision('cumplido')}
          className={cn(
            "w-full py-3.5 px-4 rounded-xl border-2 transition-all duration-200",
            "flex items-center justify-center gap-2 font-medium",
            "active:scale-[0.98]",
            currentDecision === 'cumplido'
              ? "border-success bg-success/10 text-success"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-success/50 hover:bg-success/5"
          )}
        >
          <Check className={cn(
            "h-5 w-5 transition-transform",
            currentDecision === 'cumplido' && "scale-110"
          )} />
          <span>Cumplido</span>
        </button>

        {/* No Cumplido Button */}
        <button
          type="button"
          onClick={() => onDecision('no_cumplido')}
          className={cn(
            "w-full py-3.5 px-4 rounded-xl border-2 transition-all duration-200",
            "flex items-center justify-center gap-2 font-medium",
            "active:scale-[0.98]",
            currentDecision === 'no_cumplido'
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-destructive/50 hover:bg-destructive/5"
          )}
        >
          <X className={cn(
            "h-5 w-5 transition-transform",
            currentDecision === 'no_cumplido' && "scale-110"
          )} />
          <span>No cumplido</span>
        </button>
      </div>

      {/* Comment Section - Progressive Disclosure */}
      <div className="pt-2 border-t border-slate-100">
        {!showComment ? (
          <button
            type="button"
            onClick={() => setShowComment(true)}
            className={cn(
              "w-full py-2.5 px-3 rounded-lg transition-colors",
              "flex items-center justify-center gap-2",
              "text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Añadir comentario (opcional)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <label 
              htmlFor={`comment-${criterio.id}`}
              className="text-xs font-medium text-slate-500 uppercase tracking-wide"
            >
              Comentario del criterio
            </label>
            <Textarea
              ref={textareaRef}
              id={`comment-${criterio.id}`}
              value={currentComment}
              onChange={(e) => onComentarioChange(e.target.value)}
              placeholder="Escribe una observación..."
              className="bg-slate-50 text-sm min-h-[60px] resize-none rounded-lg"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  )
}
