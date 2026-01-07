# 📚 Módulo de Carga Masiva de Docentes

## 🎯 Descripción

Este módulo implementa la funcionalidad de carga masiva de docentes siguiendo el patrón **Atomic Design** y las mejores prácticas de React/Next.js. Los componentes son reutilizables, desacoplados y mantienen una clara separación de responsabilidades.

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── docentes/
│       └── bulk-upload/
│           ├── index.ts                        # Exportaciones públicas
│           ├── bulk-upload-docentes.tsx        # Componente principal (Organismo)
│           ├── file-upload-section.tsx         # Componente de carga de archivo (Molécula)
│           ├── data-preview-table.tsx          # Componente de vista previa (Molécula)
│           ├── csv-parser.ts                   # Utilidad de parseo y validación
│           └── use-bulk-upload.ts              # Hook personalizado con lógica de negocio
└── app/
    └── (app)/
        ├── docentes/
        │   └── create-bulk/
        │       └── page.tsx                    # Página de carga masiva (contexto general)
        └── coordinador-docentes/
            └── create-bulk/
                └── page.tsx                    # Página de carga masiva (contexto coordinador)
```

## 🏗️ Arquitectura - Atomic Design

### 📄 Pages (Páginas)
- **Responsabilidad**: Configuración del contexto específico
- **Archivos**: 
  - `docentes/create-bulk/page.tsx`
  - `coordinador-docentes/create-bulk/page.tsx`
- **Características**:
  - Mínima lógica de negocio
  - Solo configuración de props específicas del contexto
  - Layout y títulos

### 🧩 Organisms (Organismos)
- **Componente**: `BulkUploadDocentes`
- **Responsabilidad**: Orquestación de componentes moleculares
- **Características**:
  - Integra `FileUploadSection` y `DataPreviewTable`
  - Usa el hook `useBulkUpload` para gestionar estado
  - Props configurables para diferentes contextos

### 🔧 Molecules (Moléculas)
1. **FileUploadSection**
   - Manejo de selección de archivos CSV
   - Descarga de plantilla
   - Feedback visual del archivo seleccionado
   - Información del formato requerido

2. **DataPreviewTable**
   - Vista previa de datos parseados
   - Visualización de errores de validación
   - Estadísticas de registros válidos/inválidos
   - Botón de acción principal con estados de carga

### ⚙️ Utilities & Hooks

1. **csv-parser.ts**
   - Parseo de archivos CSV usando PapaParse
   - Validación con Zod
   - Manejo de errores por fila
   - Tipos TypeScript estrictos

2. **use-bulk-upload.ts**
   - Hook personalizado con toda la lógica de negocio
   - Gestión de estado (archivo, datos, errores, progreso)
   - Operaciones asíncronas (carga, validación, creación)
   - Feedback al usuario con toast notifications

## 🎨 Diseño y UX

### Características de UX Moderna

✅ **Feedback Inmediato**
- Notificaciones toast para cada acción
- Estados de carga con progress bar
- Indicadores visuales de validación por registro

✅ **Jerarquía Visual Clara**
- Uso de iconos descriptivos
- Badges para estados (válido/error)
- Tarjetas con sombras y bordes sutiles
- Colores semánticos (verde=éxito, rojo=error)

✅ **Accesibilidad**
- Etiquetas descriptivas
- Estados disabled apropiados
- Tooltips informativos
- Contraste de colores adecuado

✅ **Diseño Responsivo**
- Layout flexible con max-width
- Tabla con ScrollArea para datos extensos
- Espaciados consistentes (Tailwind spacing scale)

### Paleta de Colores
- **Primario**: `primary` (acciones principales)
- **Éxito**: Verde (`bg-green-500`)
- **Error**: `destructive` (errores y validaciones fallidas)
- **Info**: Azul (`bg-blue-50/50`) para información contextual
- **Neutro**: `muted` para textos secundarios

## 🔄 Flujo de Datos

```
1. Usuario selecciona archivo CSV
   ↓
2. parseCSVFile() procesa el archivo
   ↓
3. Validación con Zod schema
   ↓
4. Estado actualizado con datos + errores
   ↓
5. DataPreviewTable muestra resultados
   ↓
6. Usuario revisa y confirma
   ↓
7. handleUpload() crea usuarios en lote
   ↓
8. Progress bar actualiza en tiempo real
   ↓
9. Notificaciones de éxito/error
```

## 📝 Formato CSV Requerido

### Columnas Obligatorias
- `nombre`: Nombre del docente
- `apellido_paterno`: Apellido paterno
- `apellido_materno`: Apellido materno
- `correo`: Email (debe ser válido)
- `contrasena`: Contraseña (mínimo 6 caracteres)

### Columnas Opcionales
- `grado_academico`: Grado académico del docente

### Ejemplo de CSV
```csv
nombre,apellido_paterno,apellido_materno,correo,contrasena,grado_academico
Juan,Pérez,García,juan.perez@example.com,MiPass123,Licenciatura
María,López,Hernández,maria.lopez@example.com,Segur@456,Maestría
```

## 🔐 Validación de Datos

Se utiliza **Zod** para validación tipada:

```typescript
const docenteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  apellido_paterno: z.string().min(1, "Apellido paterno requerido"),
  apellido_materno: z.string().min(1, "Apellido materno requerido"),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  grado_academico: z.string().optional(),
})
```

## 🚀 Uso del Módulo

### En cualquier página

```tsx
import { BulkUploadDocentes } from "@/components/docentes/bulk-upload"

export default function MyPage() {
  return (
    <div>
      <BulkUploadDocentes 
        role="docente"
        basePath="/custom-api-path"  // opcional
      />
    </div>
  )
}
```

### Props Disponibles

```typescript
interface BulkUploadDocentesProps {
  role: "docente" | "coordinador"  // Rol del usuario a crear
  basePath?: string                // Ruta base de la API (opcional)
  title?: string                   // Título personalizado (opcional)
  description?: string             // Descripción personalizada (opcional)
}
```

## 🧪 Extensibilidad

### Para agregar nuevos campos:

1. **Actualizar el schema** en `csv-parser.ts`
2. **Modificar el tipo** `DocenteData`
3. **Agregar columnas** en `DataPreviewTable`
4. **Actualizar la plantilla** en `FileUploadSection`

### Para personalizar validaciones:

Modifica el schema de Zod en `csv-parser.ts`:

```typescript
const docenteSchema = z.object({
  // ... campos existentes
  nuevo_campo: z.string().regex(/patrón/, "Mensaje de error"),
})
```

## 📦 Dependencias

- **papaparse**: Parseo de CSV
- **zod**: Validación de datos
- **react-hot-toast**: Notificaciones
- **lucide-react**: Iconos
- **shadcn/ui**: Componentes UI base

## ✨ Ventajas de esta Arquitectura

1. **Reutilización**: Componentes compartidos entre múltiples rutas
2. **Mantenibilidad**: Lógica centralizada en hooks y utilidades
3. **Testabilidad**: Cada componente puede ser testeado aisladamente
4. **Escalabilidad**: Fácil agregar nuevos campos o contextos
5. **Type Safety**: TypeScript + Zod para validación estricta
6. **UX Moderna**: Feedback inmediato y diseño accesible

## 🔍 Debugging

Para habilitar logs detallados:

```typescript
// En use-bulk-upload.ts
console.log("Registros fallidos:", failedRecords)
console.error(`Error creando docente ${i + 1}:`, error)
```

---

**Última actualización**: Enero 2026  
**Patrón de diseño**: Atomic Design  
**Framework**: Next.js 15 + React 19  
**Estilo**: Tailwind CSS + shadcn/ui
