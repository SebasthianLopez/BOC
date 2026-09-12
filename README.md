# Decision Desk

> Un agente que ayuda a equipos a convertir una decisión bloqueada en evidencia,
> una propuesta revisable y compromisos con responsables.

Proyecto de **Breakfast of Champions (BOC)** para *Agents, Everywhere: Bots,
Channels & More* — AI Tinkerers San Lorenzo, septiembre de 2026.

## El problema

Las decisiones de equipo suelen quedar repartidas entre mensajes, enlaces y
opiniones: no es claro qué evidencia falta, quién decide ni qué debe pasar
después. Un chat genérico puede responder una pregunta, pero no mantiene el
estado compartido de esa decisión.

## La solución

Decision Desk vive dentro de una página de decisión. El equipo ve alternativas,
criterios, participantes, notas y evidencia en el mismo lugar donde trabaja. El
agente usa ese contexto para:

1. detectar huecos, como evidencia faltante, un criterio ausente o falta de un
   responsable;
2. investigar una alternativa cuando una persona lo solicita;
3. adjuntar evidencia con enlaces reales a la alternativa correspondiente;
4. proponer una recomendación y compromisos con responsable y fecha;
5. esperar una aprobación humana explícita antes de crear tareas persistentes.

Rechazar una propuesta no crea tareas. Aprobar la misma propuesta dos veces no
debe duplicarlas.

## Caso oficial de demo

La demo usa una decisión concreta: elegir entre **Stripe** y **dLocal** como
pasarela de pagos para BOC Academy en Paraguay y Brasil. Empieza con huecos de
costo, cobertura local y responsable de compliance; termina con una propuesta
revisable y compromisos persistentes. El guion, datos iniciales y contratos
exactos están en [PROYECTO.md](PROYECTO.md).

## Por qué el contexto importa

El agente no recibe una pregunta aislada: lee el mapa de decisión que la persona
está revisando. Por eso puede señalar exactamente qué alternativa no tiene
evidencia de costo, qué criterio aún no fue evaluado y qué compromiso falta
para poder avanzar. Sin esa página compartida, sería solo otro chatbot.

## Stack

- **Web:** Next.js + TypeScript + CopilotKit React.
- **Agente:** OpenAI Agents SDK mediante OpenRouter.
- **Investigación:** Exa, con fuentes enlazadas a cada alternativa.
- **Resultado persistente:** Ambiguous AI, después de aprobación humana.

## Ejecutar localmente

Requisitos: Node.js 22 o superior y npm.

```bash
git clone https://github.com/SebasthianLopez/BOC.git
cd BOC
npm ci
cp .env.example .env
npm run dev:web
```

Abrí `http://127.0.0.1:3100`.

En Windows PowerShell, para crear el archivo de variables usá:

```powershell
Copy-Item .env.example .env
```

Configurá solo las variables necesarias en `.env`; nunca subas ese archivo:

```env
MODEL_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
MODEL=publisher/model-with-tools
EXA_API_KEY=...
AMBIGUOUS_API_KEY=...
```

Sin Exa, el agente debe informar que no puede investigar; no puede inventar
fuentes. Sin Ambiguous, la aprobación debe informar que no está configurada en
lugar de afirmar que creó una tarea.

## Verificación

```bash
npm run typecheck
npm run test --workspace web
```

La demostración final debe probar: detección de un hueco, investigación con una
fuente visible, propuesta de compromisos, aprobación y persistencia tras
recargar. También debe mostrar el caso de rechazo, donde no se crea ninguna
tarea.

## Trabajo del equipo

| Rol | Responsabilidad |
| --- | --- |
| P1 | Mapa de decisión y experiencia web. |
| P2 | Prompt y herramientas del agente. |
| P3 | Datos, API, persistencia e idempotencia. |
| P4 | Integración, documentación, demo y entrega. |

Cada integrante trabaja en su propia rama y abre un Pull Request hacia `main`.
P4 publica las instrucciones de configuración y las skills por rol junto con la
integración del equipo.

## Código heredado y trabajo del equipo

Este repositorio comenzó a partir de
[`CopilotKit/agents-everywhere-starter-kit`](https://github.com/CopilotKit/agents-everywhere-starter-kit).
Del starter se reutilizan la estructura del monorepo, Next.js, CopilotKit, la
configuración del modelo, el patrón de aprobación y los tests base.

El equipo BOC construye durante el hackathon el dominio de **Decision Desk**:
los tipos y datos de decisiones, el mapa de alternativas y criterios, la
detección de huecos, la investigación vinculada, las propuestas de decisión y
la creación idempotente de compromisos aprobados. La lista final de cambios se
mantiene en `SUBMISSION.md`.

## Estado

La funcionalidad se desarrolla durante el hackathon. Las afirmaciones de demo,
fuentes consultadas e IDs de tareas se validan en la integración final; no se
simulan como resultados reales.
