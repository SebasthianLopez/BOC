# Decision Desk: brief visual oficial

Este documento define el rediseño del frontend del MVP. P1 lo implementa sin cambiar comportamiento, contratos ni dependencias. La skill Taste sirve para auditar el acabado, pero esta especificación manda cuando ambas difieren.

## Lectura de diseño

Decision Desk es una herramienta B2B de trabajo, no una landing page. Debe sentirse como una mesa de decisión clara, cálida y confiable. En cinco segundos una persona debe reconocer:

1. qué se está decidiendo;
2. qué alternativas se comparan;
3. qué evidencia falta;
4. qué propone el agente;
5. qué acción requiere aprobación humana.

Valores Taste adaptados al producto:

- `DESIGN_VARIANCE: 4`: composición ordenada con asimetría leve.
- `MOTION_INTENSITY: 2`: transiciones solo para feedback y cambio de estado.
- `VISUAL_DENSITY: 7`: información compacta, legible y sin acumulación de tarjetas.
- Modo: rediseño con preservación de contenido y arquitectura.
- Base técnica: CSS existente y CSS Modules. No agregar dependencias.

## Paleta obligatoria

| Token semántico | Color | Uso principal |
| --- | --- | --- |
| `--dd-canvas` | `#FFFDED` | fondo general y superficies |
| `--dd-ink` | `#201335` | texto, títulos e iconos |
| `--dd-primary` | `#4F4789` | CTA principal, foco y selección |
| `--dd-attention` | `#FCE762` | huecos y estados pendientes |
| `--dd-evidence` | `#FFB17A` | evidencia y propuesta |

Se pueden derivar bordes y fondos suaves únicamente mezclando estos colores con transparencia o `color-mix`. No introducir otro color de marca.

Combinaciones de contraste aprobadas:

- Midnight Violet sobre Ivory: `17.02:1`.
- Ivory sobre Dusty Grape: `7.91:1`.
- Midnight Violet sobre Banana Cream: `13.89:1`.
- Midnight Violet sobre Sandy Brown: `9.80:1`.

Reglas:

- Nunca usar texto Ivory o blanco sobre Banana Cream o Sandy Brown.
- Dusty Grape es el único fondo del CTA primario.
- Banana Cream indica atención pendiente, no éxito.
- Sandy Brown distingue evidencia o una propuesta, no errores.
- Midnight Violet aporta contraste y no debe convertirse en grandes bloques decorativos.

## Estructura de la pantalla

- Mantener un encabezado compacto. No crear un hero de marketing.
- En escritorio, usar una grilla de 12 columnas: área de decisión de 7 u 8 columnas y asistente de 4 o 5 columnas.
- Dar más ancho al mapa que al chat. La decisión es el producto y el chat es una herramienta lateral.
- Mantener el asistente visible en escritorio cuando sea razonable, sin ocultar la aprobación ni bloquear el desplazamiento.
- En menos de `960px`, apilar primero la decisión y después el asistente.
- La matriz puede tener desplazamiento horizontal dentro de su contenedor. La página completa no puede desbordarse.

## Jerarquía y componentes

- Usar la tipografía ya instalada. No descargar otra fuente.
- Mostrar título y contexto antes de metadatos técnicos.
- Usar números monoespaciados o tabulares para pesos, IDs y fechas.
- Reducir el efecto de "tarjetas dentro de tarjetas". Separar grupos con espacio, fondo suave o un solo borde.
- El estado vacío de una celda debe ser evidente y legible, no parecer deshabilitado.
- Los huecos usan Banana Cream con texto Midnight Violet.
- La evidencia usa Sandy Brown de forma moderada y conserva enlaces visibles.
- La propuesta debe parecer pendiente de aprobación, nunca ya ejecutada.
- Aprobar es la única acción primaria. Rechazar es secundaria, pero siempre visible.
- Después de aprobar, mostrar dueño, fecha, ID y enlace de cada compromiso.

## Movimiento y estados

Solo se permiten transiciones breves de `transform`, `opacity`, color o borde para:

- confirmar que llegó evidencia;
- señalar que cambió un hueco;
- presentar la propuesta;
- dar feedback al presionar un botón.

No usar animaciones en bucle, parallax, scroll hijacking, partículas ni librerías de motion. Respetar `prefers-reduced-motion`.

La UI debe cubrir explícitamente: carga, vacío, error, sin configuración de Ambiguous, propuesta pendiente, rechazo, aprobación en curso y compromisos persistidos.

## Lo que no debe cambiar

- Nombres y schemas de las herramientas P1-P2.
- Tipos y adaptador de P3.
- Regla de aprobación humana.
- Textos funcionales necesarios para el guion de demo.
- Rutas, APIs, almacenamiento y configuración.
- Componentes de `apps/channel` o `apps/mobile`.

## Criterios de aceptación

- La comparación Stripe vs dLocal, los tres huecos iniciales y el CTA de investigación se distinguen sin abrir el chat.
- La acción primaria y su consecuencia son inequívocas.
- Todos los textos y controles cumplen WCAG AA con las combinaciones definidas.
- El foco de teclado es visible en enlaces, botones, `summary` y entrada del chat.
- Ningún CTA se corta o ocupa dos líneas en escritorio.
- No hay desbordamiento horizontal de página en `1440x900`, `1024x768` ni `390x844`.
- La vista móvil conserva el orden decisión, huecos, evidencia, propuesta, compromisos y asistente.
- `prefers-reduced-motion` elimina movimiento no esencial.
- No se añadieron dependencias ni se modificaron archivos fuera del alcance de P1.
- Pasan `npm run typecheck` y `npm run test --workspace web`.

Antes de declarar terminado, P1 debe mostrar capturas de escritorio y móvil o una verificación equivalente de ambas vistas.
