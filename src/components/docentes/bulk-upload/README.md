# 🎨 Componentes de Carga Masiva de Docentes

Componentes reutilizables siguiendo Atomic Design para la carga masiva de docentes.

## 📦 Exportaciones

```typescript
export { BulkUploadDocentes } from "./bulk-upload-docentes"
export { FileUploadSection } from "./file-upload-section"
export { DataPreviewTable } from "./data-preview-table"
export { useBulkUpload } from "./use-bulk-upload"
export { parseCSVFile, validateDocenteData, docenteSchema } from "./csv-parser"
export type { DocenteData, ParseResult } from "./csv-parser"
export type { DocenteDataRow } from "./data-preview-table"
```

## 🚀 Uso Rápido

```tsx
import { BulkUploadDocentes } from "@/components/docentes/bulk-upload"

<BulkUploadDocentes role="docente" />
```

## 📚 Documentación Completa

Ver [bulk-upload-docentes-architecture.md](../../docs/bulk-upload-docentes-architecture.md)
