"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { AppControl } from "@/components/app-control";
import { GenerativeUI } from "@/components/generative-ui";
import { DecisionDesk } from "@/components/decision-desk/decision-desk";
// INTEGRACION (P4): cuando entre P3 esto pasa a ser
//   import { useDecisionWorkplace } from "@/lib/use-decision-workplace";
// y se borra el stand-in de components/decision-desk/. El hook devuelve la
// misma forma `DecisionWorkplace`, asi que nada mas en esta pagina cambia.
import { useDecisionDesk } from "@/components/decision-desk/use-decision-desk";

export default function Home() {
  const workplace = useDecisionDesk();

  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "Que falta para decidir",
          message:
            "Leé la decisión de la página y decime qué falta: qué alternativa y criterio siguen sin evidencia, y qué compromiso no tiene responsable.",
        },
        {
          title: "Investigá dLocal",
          message:
            "Investigá cobertura local y costos de dLocal para Paraguay y Brasil, y fijá la evidencia en el mapa con las fuentes que encuentres.",
        },
        {
          title: "Proponé compromisos",
          message:
            "Con lo que hay en la página, recomendá un camino provisional y dejá los compromisos listos para que yo los apruebe. No crees nada todavía.",
        },
      ],
      available: "before-first-message",
    },
    [],
  );

  return (
    <>
      <GenerativeUI />
      <AppControl workplace={workplace} />
      <main className="ck-workspace">
        <header className="ck-workspace-header">
          <div>
            <p className="ck-eyebrow">Breakfast of Champions · Decision Desk</p>
            <h1>Decision Desk</h1>
            <p className="ck-intro">
              Una decisión compartida, la evidencia que la sostiene y los
              compromisos que genera. El asistente lee esta página; no decide
              por el equipo.
            </p>
          </div>
          <span className="ck-tag">Caso de demo</span>
        </header>

        <div className="ck-workspace-grid">
          <DecisionDesk workplace={workplace} />

          <section
            className="ck-panel ck-assistant"
            aria-labelledby="assistant-title"
          >
            <header className="ck-assistant-header">
              <h2 id="assistant-title">Preguntale al facilitador</h2>
              <p>
                Puede encontrar huecos, adjuntar evidencia investigada y dejar
                compromisos listos para tu aprobación.
              </p>
            </header>
            <CopilotChat
              className="ck-chat"
              labels={{
                welcomeMessageText: "¿Qué está trabando esta decisión?",
                chatInputPlaceholder: "Preguntá sobre esta decisión…",
              }}
            />
          </section>
        </div>
      </main>
    </>
  );
}
