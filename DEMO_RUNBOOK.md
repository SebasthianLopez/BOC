# Decision Desk: guía oficial de grabación

P2 presenta y graba. P4 prepara el entorno, confirma que `main` está integrado y realiza la verificación final. Presentar la demo no autoriza a P2 a editar archivos fuera de `packages/agent-core/**`.

## Historia que debe entender P2

Una academia quiere vender en Paraguay y Brasil, pero su equipo no logra cerrar la elección entre Stripe y dLocal. La información está incompleta y las responsabilidades no están claras.

Decision Desk vive dentro de la decisión compartida. El agente ve alternativas, criterios, huecos y evidencia; investiga cuando se lo piden y prepara compromisos. Solo el botón de aprobación humana puede crear tareas externas.

La diferencia frente a un chat independiente es el estado visible y compartido: el agente sabe qué decisión está abierta, qué falta, dónde colocar una fuente y qué compromisos siguen pendientes.

## Condiciones para grabar

P4 debe confirmar todas antes de iniciar:

- Los PR finales de P1, P2 y P3 están fusionados en `main`.
- `npm run verify` pasa sobre un clon o árbol limpio de `main`.
- OpenRouter responde con el modelo configurado.
- Exa devuelve al menos una fuente real y clicable para la consulta oficial.
- Ambiguous usa exclusivamente el workspace de prueba y permite crear y releer tareas.
- La propuesta contiene solo los compromisos oficiales de Diego y Sofía.
- Ninguna fecha ISO está en el pasado.
- Rechazar crea cero tareas.
- Aprobar muestra los IDs y, si el proveedor los entrega, enlaces de registro.
- Recargar conserva los mismos compromisos sin duplicarlos.

Si una condición falla, no se graba todavía. P2 informa a P4 qué paso falló y qué se observó, sin cambiar código de P1 o P3.

## Preparación de pantalla

1. Usar formato horizontal `1920x1080` o `1280x720`.
2. Cerrar correo, mensajería, terminales, editores y pestañas con credenciales.
3. Desactivar notificaciones del sistema.
4. Abrir dos pestañas del mismo navegador:
   - Decision Desk en `http://127.0.0.1:3100`.
   - La lista de tareas del workspace de prueba de Ambiguous.
5. Ajustar el zoom para que decisión y asistente sean legibles sin texto diminuto.
6. Comprobar micrófono con una grabación de diez segundos.
7. Usar el grabador ya disponible. En Windows puede ser Recortes en modo grabación; no instalar otra herramienta solo para esta demo.
8. Ensayar hasta el rechazo. Reservar la aprobación real para la toma final o usar un workspace de ensayo separado.

Nunca mostrar `.env`, API keys, consola, DevTools, correos personales ni administración de cuentas.

## Prompts exactos

Investigación:

```text
Investigá cobertura local y costos de dLocal para Paraguay y Brasil. Adjuntá al mapa únicamente evidencia con fuentes reales.
```

Propuesta:

```text
Con la evidencia disponible, prepará la propuesta provisional oficial y dejá los compromisos listos para aprobación. No crees tareas todavía.
```

Para repetir la propuesta después del rechazo:

```text
Volvé a preparar la misma propuesta provisional para que el equipo pueda aprobarla. No cambies responsables, compromisos ni fechas.
```

## Guion de dos minutos

Los tiempos incluyen cortes de esperas de red. Se puede editar el tiempo muerto, pero no sustituir respuestas ni simular resultados.

### 0:00-0:15. Problema y contexto

Mostrar la decisión completa, no empezar dentro del chat.

Narración:

> Elegir una pasarela para Paraguay y Brasil parece sencillo, pero el equipo tiene evidencia dispersa, criterios incompletos y nadie sabe qué sigue. Decision Desk pone al agente dentro de la decisión que el equipo ya está mirando.

### 0:15-0:30. Estado compartido

Señalar Stripe, dLocal, los criterios y los tres huecos iniciales.

Narración:

> Antes de escribir un prompt ya vemos las alternativas, los criterios y tres bloqueos concretos. Este contexto compartido es lo que un chatbot aislado perdería.

### 0:30-0:55. Investigación con Exa

Enviar el prompt de investigación. Mostrar cómo la evidencia llega al mapa y abrir brevemente una fuente real.

Narración:

> Le pedimos investigar solo cuando hace falta. Exa devuelve fuentes reales y el agente coloca cada hallazgo junto a la alternativa y el criterio correspondiente.

No afirmar que una tarifa o cobertura quedó confirmada si la fuente visible no lo respalda.

### 0:55-1:17. Propuesta revisable

Enviar el prompt de propuesta. Mostrar recomendación, explicación, Diego, Sofía y fechas.

Narración:

> El agente no elige por nosotros. Propone una prueba técnica y convierte lo que falta en compromisos revisables. Todavía no se escribió ninguna tarea externa.

Detener la toma si aparece una fecha pasada, un responsable adicional o compromisos distintos de los oficiales.

### 1:17-1:30. Rechazo seguro

Presionar Rechazar y mostrar el mensaje de que no se creó nada.

Narración:

> Rechazar termina aquí. No existe una instrucción oculta desde el chat y no se crea ninguna tarea.

### 1:30-1:49. Aprobación y escritura

Volver a preparar la propuesta, revisar los mismos campos y presionar Aprobar.

Narración:

> Solo esta aprobación explícita autoriza al servidor a escribir en Ambiguous. La respuesta muestra los identificadores reales de los compromisos.

### 1:49-1:57. Verificación externa y persistencia

Mostrar los registros correspondientes en la pestaña de Ambiguous. Volver a la aplicación, recargar y mostrar los mismos IDs sin duplicados.

Narración:

> Los registros existen en el workspace de prueba y persisten al recargar. Repetir una aprobación no los duplica.

Si Ambiguous no entrega un enlace individual, mostrar el ID en Decision Desk y el registro correspondiente en la lista real. Nunca fabricar una URL.

### 1:57-2:00. Cierre

Narración:

> CopilotKit aporta la experiencia contextual, OpenRouter ejecuta el agente, Exa investiga y Ambiguous convierte una decisión aprobada en trabajo verificable.

## Qué debe verse para cada criterio

| Criterio | Evidencia visible |
| --- | --- |
| Funcionalidad | Flujo completo desde decisión hasta compromiso persistido |
| Innovación | El agente utiliza el mapa existente y actualiza esa misma superficie |
| Integración técnica | OpenRouter, Exa, aprobación de servidor y registro real en Ambiguous |
| Utilidad | Huecos concretos se convierten en evidencia y tareas con responsables |

## Contingencias

- Exa no responde o no devuelve fuentes: detener la toma y revisar configuración. No usar una respuesta inventada.
- El modelo llama `open_proposal` sin `propose_decision`: detener la toma y reportar el orden exacto de tools a P4.
- Aparece una fecha pasada: no aprobar; reportarlo a P4/P2.
- Ambiguous crea la tarea pero no entrega URL: mostrar ID y registro en el workspace después del hotfix acordado.
- Aparecen compromisos anteriores al comenzar: usar un workspace de prueba limpio o pedir a P4 que prepare el estado. No borrar tareas en masa.
- Una aprobación duplica tareas: detener la grabación y reportar los IDs a P4/P3.

## Revisión del archivo final

- Duración máxima de dos minutos.
- Audio entendible, sin música que tape la voz.
- Texto legible en teléfono y computadora.
- Ningún secreto, correo, notificación o dato personal visible.
- Se distingue claramente propuesta, rechazo, aprobación y resultado externo.
- El archivo se reproduce completo antes de subirlo.
- Nombre sugerido: `decision-desk-demo-final.mp4`.

P2 entrega el video a P4. P4 revisa duración, seguridad, exactitud técnica y requisitos del portal antes de publicarlo.
