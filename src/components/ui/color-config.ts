// Este módulo define la configuración estática de colores usada en la interfaz.
// - Solo contiene definiciones (valores HSL y colores utilitarios).
// - No aplica estilos ni efectos visuales; sirve como fuente única de verdad.

// Este módulo define la configuración estática de colores usada en la interfaz.
// - Solo contiene definiciones (valores HSL y colores utilitarios).
// - No aplica estilos ni efectos visuales; sirve como fuente única de verdad.
// - Actualizado según Design System: Azul (#001970), Rojo (#E2231A), Negro (#1A1A1A).
// - NOTA IMPORTANTE: Los estados semánticos (Success, Warning, Info, Destructive) han sido
//   estrictamente mapeados a los colores institucionales para mantener la armonía cromática.

export type ColorPalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  info: string;
  infoForeground: string;
  warningForeground: string;
  destructive: string;
  destructiveForeground: string;
  warning: string;
  success: string;
  successForeground?: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  chart: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  // Sidebar-specific tokens
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  // Toast / helper colors (from utilities)
  toastDestructiveWave?: string;
  toastDestructiveIconBg?: string;
  toastDestructiveIcon?: string;
  toastSuccessWave?: string;
  toastSuccessIconBg?: string;
  toastSuccessIcon?: string;
  // Component-specific literal colors found in the codebase
  floatingButtonBg?: string;
  sidebarCircleBg?: string;
  loginButtonBg?: string;
  loginButtonHover?: string;
  loginBgGradientStart?: string;
  loginBgGradientEnd?: string;
  glassCardBg?: string;
  glassCardBorder?: string;
  chartGridStroke?: string;
  chartDotStroke?: string;
};

// VALORES BASE INSTITUCIONALES (CONSTANTES INTERNAS)
// Navy: #001970 -> hsl(227, 100%, 22%)
// Red:  #E2231A -> hsl(3, 79%, 49%)
// Black:#1A1A1A -> hsl(0, 0%, 10%)
// Gray: #F5F5F5 -> hsl(0, 0%, 96%)

// Palette basada en las variables definidas en `src/globals.css` (:root)
export const lightPalette: ColorPalette = {
  background: 'hsl(0 0% 96%)', // Neutral 50 (#f5f5f5)
  foreground: 'hsl(0 0% 10%)',  // Brand Black (#1A1A1A)
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(0 0% 10%)',
  popover: 'hsl(0 0% 100%)',
  popoverForeground: 'hsl(227 100% 22%)', // Brand Navy
  primary: 'hsl(227 100% 22%)', // Brand Navy (#001970)
  primaryForeground: 'hsl(0 0% 98%)',
  secondary: 'hsl(3 79% 49%)', // Brand Red (#E2231A)
  secondaryForeground: 'hsl(0 0% 100%)',
  muted: 'hsl(0 0% 96%)',
  mutedForeground: 'hsla(0, 0%, 100%, 1.00)',
  accent: 'hsl(3 79% 49%)', // Brand Red (#E2231A)
  accentForeground: 'hsl(0 0% 100%)',
  
  // ESTADOS SEMÁNTICOS ESTRICTOS
  // Destructive (Error) -> Brand Red
  destructive: 'hsl(3 79% 49%)',
  destructiveForeground: 'hsl(0 0% 100%)',
  // Warning (Alerta) -> Brand Red (High Attention)
  warning: 'hsl(3 79% 49%)', 
  warningForeground: 'hsl(0 0% 100%)',
  // Success (Confirmación) -> Brand Navy (Corporate Stability)
  success: 'hsl(227 100% 22%)', 
  successForeground: 'hsl(0 0% 100%)', 
  // Info (Información) -> Brand Navy
  info: 'hsl(227 100% 22%)', 
  infoForeground: 'hsl(0 0% 100%)',
  
  border: 'hsl(0 0% 89.8%)', // Neutral gray
  input: 'hsl(0 0% 89.8%)',
  ring: 'hsl(227 100% 22%)', // Brand Navy
  radius: '1.5rem',
  
  // GRÁFICOS: Solo paleta institucional
  chart: {
    1: 'hsl(227 100% 22%)', // Navy
    2: 'hsl(3 79% 49%)',    // Red
    3: 'hsl(0 0% 10%)',     // Black
    4: 'hsl(227 80% 40%)',  // Navy Tint (Lighter)
    5: 'hsl(3 79% 65%)',    // Red Tint (Lighter)
  },
  
  sidebarBackground: 'hsl(227 100% 15%)', // Darker Navy
  sidebarForeground: 'hsl(0 0% 98%)',
  sidebarPrimary: 'hsl(3 79% 49%)', // Red
  sidebarPrimaryForeground: 'hsl(0 0% 100%)',
  sidebarAccent: 'hsl(0 0% 100% / 0.1)',
  sidebarAccentForeground: 'hsl(0 0% 98%)',
  sidebarBorder: 'hsl(227 100% 20%)',
  sidebarRing: 'hsl(3 79% 49%)',
  
  // TOASTS: Armonizados
  toastDestructiveWave: 'rgba(226, 35, 26, 0.23)', // Red
  toastDestructiveIconBg: 'rgba(226, 35, 26, 0.28)',
  toastDestructiveIcon: '#E2231A',
  toastSuccessWave: 'rgba(0, 25, 112, 0.23)', // Navy (Success is now Navy)
  toastSuccessIconBg: 'rgba(0, 25, 112, 0.28)',
  toastSuccessIcon: '#001970',
  
  // LITERATALES
  floatingButtonBg: '#001970',
  sidebarCircleBg: '#001970',
  loginButtonBg: '#001970',
  loginButtonHover: '#E2231A',
  loginBgGradientStart: 'rgba(0, 25, 112, 0.9)',
  loginBgGradientEnd: 'rgba(226, 35, 26, 0.9)',
  glassCardBg: 'rgba(255, 255, 255, 0.15)',
  glassCardBorder: 'rgba(255, 255, 255, 0.2)',
  chartGridStroke: '#ccc',
  chartDotStroke: '#fff',
};

// Palette basada en las variables definidas en `src/globals.css` (.dark)
export const darkPalette: ColorPalette = {
  background: 'hsl(0 0% 10%)', // Brand Black
  foreground: 'hsl(0 0% 100%)',
  card: 'hsl(0 0% 10%)',
  cardForeground: 'hsl(0 0% 100%)',
  popover: 'hsl(0 0% 10%)',
  popoverForeground: 'hsl(0 0% 98%)',
  
  // En Dark Mode, usamos tintes legibles pero derivados del tono base
  primary: 'hsl(227 100% 65%)', // Navy aclarado (Accesible)
  primaryForeground: 'hsl(227 100% 22%)',
  secondary: 'hsl(3 79% 60%)',  // Red aclarado (Accesible)
  secondaryForeground: 'hsl(0 0% 98%)',
  muted: 'hsl(240 4% 16%)',
  mutedForeground: 'rgba(255,255,255,0.8)',
  accent: 'hsl(3 79% 60%)',
  accentForeground: 'hsl(0 0% 98%)',
  
  // ESTADOS SEMÁNTICOS (Dark Mode)
  destructive: 'hsl(3 79% 60%)', // Red aclarado
  destructiveForeground: 'hsl(0 0% 98%)',
  warning: 'hsl(3 79% 60%)',     // Red aclarado
  success: 'hsl(227 100% 65%)',  // Navy aclarado (Consistente con Primary)
  successForeground: 'hsl(0 0% 100%)', 
  info: 'hsl(227 100% 65%)',     // Navy aclarado
  infoForeground: 'hsl(0 0% 98%)',
  warningForeground: 'hsl(0 0% 0%)',
  
  border: 'hsl(240 4% 16%)',
  input: 'hsl(240 4% 16%)',
  ring: 'hsl(227 100% 65%)',
  radius: '1.5rem',
  
  chart: {
    1: 'hsl(227 100% 65%)', // Navy Light
    2: 'hsl(3 79% 60%)',    // Red Light
    3: 'hsl(0 0% 80%)',     // White/Gray
    4: 'hsl(227 60% 50%)',  // Navy Muted
    5: 'hsl(3 60% 50%)',    // Red Muted
  },
  
  sidebarBackground: 'hsl(0 0% 10%)',
  sidebarForeground: 'hsl(0 0% 98%)',
  sidebarPrimary: 'hsl(227 100% 65%)',
  sidebarPrimaryForeground: 'hsl(227 100% 22%)',
  sidebarAccent: 'hsl(227 100% 65% / 0.1)',
  sidebarAccentForeground: 'hsl(0 0% 98%)',
  sidebarBorder: 'hsl(240 4% 16%)',
  sidebarRing: 'hsl(227 100% 65%)',
  
  toastDestructiveWave: 'rgba(226, 35, 26, 0.23)',
  toastDestructiveIconBg: 'rgba(226, 35, 26, 0.28)',
  toastDestructiveIcon: '#ff6b6b', // Red Light
  toastSuccessWave: 'rgba(0, 25, 112, 0.23)',
  toastSuccessIconBg: 'rgba(0, 25, 112, 0.28)',
  toastSuccessIcon: '#6b8aff',   // Navy Light
  
  // Literales
  floatingButtonBg: '#001970',
  sidebarCircleBg: '#001970',
  loginButtonBg: '#001970',
  loginButtonHover: '#E2231A',
  loginBgGradientStart: 'rgba(0, 25, 112, 0.8)',
  loginBgGradientEnd: 'rgba(226, 35, 26, 0.8)',
  glassCardBg: 'rgba(255, 255, 255, 0.15)',
  glassCardBorder: 'rgba(255, 255, 255, 0.2)',
  chartGridStroke: '#ccc',
  chartDotStroke: '#fff',
};

export const ColorConfig = {
  light: lightPalette,
  dark: darkPalette,
};

// Recomendación de almacenamiento (documentada):
// - Por ahora: módulo TS (esta implementación) es suficiente (estático, versión controlada).
// - Futuro: mover a `src/config/colors.json` o a una API/DB si debe ser editable por usuario.
// - Para personalización en cliente: persistir overrides en `localStorage` y aplicar mediante
//   un pequeño proveedor que setee variables CSS (no incluido aquí por petición).
