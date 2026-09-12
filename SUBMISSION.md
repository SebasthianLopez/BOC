# Submission checklist

Choose your city on the [global event page](https://aitinkerers.org/hackathons/global/agents-everywhere). Use that city's participant portal for the submission deadline and published judging criteria, and its handbook for eligibility and required deliverables. See [hackathon-rules.md](hackathon-rules.md) for the agent-readable summary.

> **Estado al 2026-09-12.** Título, descripción y repositorio están listos. **Faltan el video y el post social**, que requieren una persona. Los pendientes bloqueantes están al final.

## Build eligibility

- [x] Our submitted project is a net-new build created during the official hackathon period
- [x] Its core functionality was built during the event; we are not resubmitting or extending a pre-existing project and entering it as new
- [x] We identify inherited templates, libraries, prompts, components, and starter code separately from our event work

**What we inherited**

El repositorio arranca de [`CopilotKit/agents-everywhere-starter-kit`](https://github.com/CopilotKit/agents-everywhere-starter-kit), commit base `b44ba8c`. Del starter se reutilizan:

- La estructura del monorepo, Next.js y la configuración de CopilotKit.
- La resolución de modelo (`packages/agent-core/src/model.ts`) y el cliente de Exa.
- El patrón de aprobación con sesión, validación de origen y escritura vía MCP.
- El cliente de Ambiguous (`apps/web/src/lib/server/workplace.ts`) y sus tests.
- El CSS base (`apps/web/src/app/globals.css`) y los tests del starter.
- La app de incidentes, que era código de referencia de infraestructura. **Fue reemplazada, no renombrada**: `workplace-followups.tsx` se eliminó y `page.tsx` se reescribió sobre el dominio de decisiones.

**What we built during the hackathon**

El dominio completo de **Decision Desk**. Contra la línea base `b44ba8c`, en `apps/` y `packages/`: 17 archivos, +764 / −860 líneas, más la carpeta nueva `apps/web/src/components/decision-desk/`.

| Pieza | Dónde | Rol |
| --- | --- | --- |
| Tipos y datos del caso (`Decision`, `Criterion`, `Alternative`, `Evidence`, `Gap`, `Proposal`) | `apps/web/src/lib/decisions.ts` | P3 |
| Hook de página y adaptador de aprobación | `apps/web/src/lib/use-decision-workplace.ts` | P3 |
| Persistencia idempotente de compromisos y relectura por `decisionId` | `apps/web/src/lib/server/followups.ts` | P3 |
| Detección de huecos, investigación con Exa y propuesta | `packages/agent-core/src/decision-desk.ts` | P2 |
| Herramientas de servidor `detect_gaps`, `research_alternative`, `propose_decision` | `packages/agent-core/src/decision-tools.ts` | P2 |
| Prompt del facilitador y schemas Zod | `packages/agent-core/src/prompt.ts`, `schemas.ts` | P2 |
| Mapa de decisión: matriz alternativas × criterios, huecos, evidencia, propuesta y compromisos | `apps/web/src/components/decision-desk/` | P1 |
| Contexto de página y herramientas visuales `show_gaps`, `attach_evidence`, `open_proposal`, `refresh_commitments` | `apps/web/src/components/app-control.tsx` | P1 |
| Guardas contra IDs y URLs alucinados | `apps/web/src/components/decision-desk/guards.ts` | P1 |
| Rediseño con la paleta oficial | `apps/web/src/components/decision-desk/decision-desk.module.css` | P1 |

Equipo: **Sebasthian Lopez Arias** (P1 frontend), **Hans Mersch** (P2 agente), **Ingrid Moriñigo** (P3 servidor), **Jhonatan Insfran** (P4 integración). Cada rol trabajó en su rama y abrió Pull Request hacia `main`.

## Title and description

**Project title**

Decision Desk

**What you built**

Decision Desk es una página de decisión compartida con un agente adentro. El equipo ve las alternativas, los criterios, quién participa y qué evidencia respalda cada celda de la comparación. El agente lee ese estado y trabaja sobre él:

1. **Detecta huecos** — qué alternativa no tiene evidencia contra qué criterio, qué compromiso no tiene responsable.
2. **Investiga solo cuando se lo piden** — busca con Exa y adjunta la evidencia a la celda que corresponde, con la URL real que devolvió el servicio.
3. **Propone** — una recomendación provisional y los compromisos que la destrabarían, con responsable y fecha.
4. **Espera la aprobación humana** — solo el botón de la página puede crear tareas en Ambiguous. Estar de acuerdo en el chat no autoriza nada.

Rechazar crea cero tareas. Aprobar escribe los compromisos, devuelve los identificadores reales del proveedor y los vuelve a leer al recargar.

**Who it is for**

Valeria, Diego y Sofía tienen que elegir la pasarela de pagos para que BOC Academy pueda vender un curso online a clientes de **Paraguay y Brasil**. Stripe es lo que el equipo ya sabe integrar, pero nadie confirmó su cobertura en esos mercados. dLocal ofrece métodos de pago locales, pero faltan datos comparables de costo, soporte y cumplimiento. La decisión lleva semanas dando vueltas entre mensajes porque nadie escribió qué falta exactamente.

**Why the context matters**

El agente no recibe una pregunta suelta: lee el mapa de decisión que la persona está mirando. Por eso puede decir *"dLocal no tiene evidencia de costo por transacción"* en vez de *"deberías comparar costos"*, y por eso sabe dónde colocar una fuente cuando la encuentra.

Si se saca esa superficie, se pierden cuatro cosas concretas:

| Sin la página | Con la página |
| --- | --- |
| El agente pregunta de qué decisión hablás | Sabe qué decisión está abierta y quién participa |
| Da consejos genéricos sobre comparar proveedores | Nombra la celda exacta que está vacía |
| La evidencia queda en el chat y se pierde al cerrar | La evidencia se fija en la alternativa y el criterio, y la ve todo el equipo |
| "Aprobado" es una palabra en una conversación | La aprobación es un control con consecuencia verificable: un registro con su ID |

Un chatbot aislado puede responder *cómo* comparar pasarelas. No puede mantener el estado compartido de **esta** decisión ni convertir un acuerdo en trabajo asignado.

**Sponsor technologies used**

Solo las que participan del flujo, con su aporte visible:

| Sponsor | Aporte visible |
| --- | --- |
| **CopilotKit** | La experiencia contextual en la web. `useAgentContext` publica el mapa de decisión; las herramientas de frontend dejan que el agente actualice la misma superficie que el equipo mira. |
| **OpenRouter** | Ejecuta el agente. `MODEL_PROVIDER=openrouter`. |
| **Exa** | La investigación. `research_alternative` devuelve únicamente URLs reales que Exa retornó; sin la key declara la limitación y no adjunta nada. |
| **Ambiguous AI** | El resultado persistente. Tras la aprobación humana, el servidor crea los compromisos vía MCP y los relee por `decisionId`. |

No se usaron Auth0, Trigger.dev, Mozilla ni Google Cloud Run. `@openai/agents` es dependencia del starter y solo aparece en la ruta de voz heredada (`apps/web/src/app/voice/`), fuera del MVP: el modelo del Decision Desk va por OpenRouter.

## Evidence for the judging criteria

Judges score each of the four official criteria from 1–5. This checklist helps you gather evidence; it does not guarantee a score. A working starter is a foundation for your own project.

| Official criterion | Show in your project and demo |
|---|---|
| Core Requirements & Functionality | Run one complete workflow in the intended environment, from user request through tools to a verified result. Repeat it with live integrations; offline tests alone do not prove the deployed flow. |
| Innovation & Theme Alignment | Show the surrounding context before the prompt and explain the original interaction it enables. Compare with the context removed: what value would a standalone chatbox lose? |
| Technical Execution & Integration | Show how tools, data, and the environment connect. Demonstrate a relevant failure or cancellation path and explain recovery, state persistence, and integration limits. |
| Usefulness & Agentic Experience | Identify the user and problem, show a meaningful action in the surface, and demonstrate clear feedback and appropriate user control. Explain what work the agent saves. |

**Nuestra evidencia por criterio**

| Criterio | Evidencia y estado |
| --- | --- |
| **Core Requirements & Functionality** | El flujo completo existe: decisión visible → huecos → investigación → propuesta → aprobación → compromisos persistidos. El **rechazo está comprobado punta a punta** contra la API real (`{"status":"declined"}` y cero tareas creadas). **La aprobación no se verificó de punta a punta** desde el arreglo de tareas sin URL. |
| **Innovation & Theme Alignment** | El agente actualiza **la misma superficie** que el equipo mira: la evidencia aterriza en la celda, no en el chat. La comparación "con y sin contexto" está arriba. |
| **Technical Execution & Integration** | CopilotKit + OpenRouter + Exa + Ambiguous en un solo flujo. **Caminos de fallo verificados**: sin Exa el agente declara la limitación y no adjunta evidencia — comprobado con el modelo real, respondió *"no debo inventar enlaces, fuentes ni datos de tarifas"*. Sin Ambiguous la página informa que no está configurado en vez de afirmar que creó algo. Las guardas del frontend rechazan IDs y URLs que no existen en la página y le devuelven el motivo al modelo. |
| **Usefulness & Agentic Experience** | Un usuario concreto con un problema concreto. Tres huecos se convierten en evidencia y compromisos asignados. Una sola compuerta de aprobación, en la página, con los compromisos escritos textualmente antes de decidir. |

**Verificación del agente contra el modelo real**

| Prueba | Resultado |
| --- | --- |
| "¿Qué falta? Mostralo en el mapa" | `show_gaps` con 7 huecos, todos con IDs reales. Las guardas rechazaron 0 |
| "Proponé compromisos" | `open_proposal` con `decisionId` correcto, recomendación provisional y responsables reales |
| "Investigá dLocal", sin Exa disponible | **No llamó `attach_evidence`.** Declaró que no debe inventar fuentes |

- [x] We can point to visible evidence for every criterion
- [x] We distinguish live services, sample data, session-only state, and standalone recipes
- [x] Sponsor technologies contribute to the workflow; their count is not a judging criterion

## Public repository

**https://github.com/SebasthianLopez/BOC** — visibilidad `PUBLIC`.

```bash
git clone https://github.com/SebasthianLopez/BOC.git
cd BOC
npm ci
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
npm run dev:web
```

Abrir `http://127.0.0.1:3100`.

| Variable | Para qué | Si falta |
| --- | --- | --- |
| `MODEL_PROVIDER=openrouter` | Elige el proveedor | `resolveModel()` lanza error y el chat no responde |
| `OPENROUTER_API_KEY` | Ejecuta el agente | Ídem |
| `MODEL` | p. ej. `google/gemini-3.8-flash` | Ídem |
| `EXA_API_KEY` | Investigación | El agente informa que no puede investigar y no inventa fuentes |
| `AMBIGUOUS_API_KEY` | Compromisos persistentes | La página informa que no está configurado en vez de afirmar que creó una tarea |

- [ ] A new participant can run the quickstart from a clean clone — **ver bloqueante 1**
- [x] The README lists the credentials and separate processes required
- [ ] `npm run verify` passes; optional recipe checks pass if used — **ver bloqueante 2**
- [ ] `.env`, tokens, generated traces with sensitive data, and account secrets are excluded — **ver nota de seguridad**
- [x] Sample data, session-only state, and unimplemented integrations are clearly labeled

**Checks ejecutados el 2026-09-12**

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | PASS en los 3 workspaces |
| `npm run test --workspace web` | 23/23 |
| Tests de componentes del frontend | 15/15 |
| Tests de `agent-core` invocados directamente | 44/44 |
| App en `127.0.0.1:3100` | HTTP 200, 0 errores; el caso Stripe vs dLocal carga con 8 celdas vacías y los 3 huecos |
| `GET /api/followups?decisionId=boc-payment-gateway` | `status: connected` contra el workspace real |

**Total: 82 tests pasando.**

Los tests de componentes no entran en `npm test` porque el script de `apps/web/package.json` enumera archivos a mano:

```powershell
Push-Location apps/web
$tests = @(Get-ChildItem -Path src/components/decision-desk -Filter '*.test.ts' -Recurse | ForEach-Object { $_.FullName })
node --import tsx --test $tests
Pop-Location
```

## Two-minute demo video

**Estado: pendiente de grabar.** El guion completo, con tiempos, narración textual y contingencias, está en [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md). P2 presenta y graba; P4 prepara el entorno y verifica.

| Tiempo | Qué se muestra |
| --- | --- |
| 0:00–0:15 | La decisión completa antes de escribir un prompt |
| 0:15–0:30 | Alternativas, criterios y los tres huecos iniciales |
| 0:30–0:55 | Investigación con Exa; la evidencia aterriza en la celda y se abre una fuente real |
| 0:55–1:17 | Propuesta revisable con responsables y fechas. Nada escrito todavía |
| 1:17–1:30 | Rechazo: no se creó ninguna tarea |
| 1:30–1:49 | Aprobación: el servidor escribe y devuelve identificadores reales |
| 1:49–1:57 | Los registros en Ambiguous y la persistencia tras recargar, sin duplicados |
| 1:57–2:00 | Cierre nombrando los sponsors |

- [ ] Show the surface and existing context before the prompt
- [ ] Demonstrate one complete interaction
- [ ] Show a visible result: an actual record, local state change, or research source links
- [ ] If showing an approval, distinguish the decision from execution and demonstrate the resulting behavior
- [ ] State which sponsor technologies made the interaction possible
- [ ] Keep the video within the event's limit and check audio

For Decision Desk, follow [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md). The inherited
[demo prompts](dev-docs/demo-prompts.md) remain reference material for the
starter's incident workflow and are not the submission script.

## Social post and final submission

**Estado: pendiente de publicar.** Borrador para adaptar. **Confirmar los handles con las instrucciones del organizador antes de publicar**: los de abajo son los habituales, no verificados.

> Construimos **Decision Desk** en Agents, Everywhere de @aitinkerers 🇵🇾
>
> Un agente que no vive en un chat aparte: vive **dentro de la decisión** que el equipo ya está mirando. Ve las alternativas, señala qué evidencia falta, investiga cuando se lo pedís y deja compromisos con responsable listos para aprobar.
>
> Nada se escribe sin que una persona toque Aprobar.
>
> @CopilotKit para la experiencia contextual · @OpenRouterAI para ejecutar el agente · @ExaAILabs para investigar con fuentes reales · @ambiguous_ai para convertir la decisión aprobada en trabajo verificable.
>
> Código 👉 https://github.com/SebasthianLopez/BOC
> Demo 👉 [enlace del video]
>
> \#AgentsEverywhere #AITinkerers

- [ ] Follow the organizer's posting and sponsor-tagging instructions
- [ ] Link the public repository and video
- [ ] Credit the sponsors you used and applicable local partners
- [ ] Check the live integration once more before recording or submitting
- [ ] Inspect the repository, video and screenshots for secrets

Prepare the post and submission for a human to publish; running the starter kit
does not publish either automatically.

## Bloqueantes antes de entregar

| # | Pendiente | Quién |
| --- | --- | --- |
| 1 | **Un clon limpio no levanta el agente.** El `.env` versionado tiene la clave de OpenRouter en `OPENAI_API_KEY`, pero `resolveModel()` la busca en `OPENROUTER_API_KEY`. Es una línea, y pega justo en "a new participant can run the quickstart". | P4 |
| 2 | **`npm run verify` corre 0 tests de `agent-core` y `channel` en Windows.** Los scripts usan un glob entre comillas simples (`'src/**/*.test.ts'`) que PowerShell no expande, así que Node no encuentra nada y el comando pasa sin correr un solo test. Los 44 tests existen y pasan cuando se los invoca directamente. | P4 |
| 3 | **Grabar el video de dos minutos.** | P2 graba, P4 verifica |
| 4 | **Publicar el post social** con los handles confirmados. | P4 |
| 5 | **Verificar el flujo vivo en el navegador**: `detect_gaps → show_gaps` y `research_alternative → attach_evidence` dentro de CopilotKit. | P4 con P2 |
| 6 | **Verificar aprobación y persistencia** tras el arreglo de tareas sin URL. Es el cierre del video. | P4 con P3 |
| 7 | **Confirmar el deadline** en el portal de la ciudad. No suponer zona horaria. | P4 |
| 8 | `<html lang="en">` con la interfaz en español (`apps/web/src/app/layout.tsx`). | P4 |

### Nota de seguridad

El repositorio es **público** y tiene un `.env` versionado con credenciales de OpenRouter y Exa. El equipo confirmó que son claves de prueba autorizadas para el hackathon. **Recomendación: rotarlas al cerrar el evento**, porque los escáneres automáticos encuentran claves en repos públicos en minutos.
