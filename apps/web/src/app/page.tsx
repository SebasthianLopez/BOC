"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { AppControl } from "@/components/app-control";
import { GenerativeUI } from "@/components/generative-ui";
import { DecisionDesk } from "@/components/decision-desk/decision-desk";
import styles from "@/components/decision-desk/decision-desk.module.css";
import { useDecisionWorkplace } from "@/lib/use-decision-workplace";

export default function Home() {
  const workplace = useDecisionWorkplace();

  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "Qué falta para decidir",
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
    /*
     * El shell fija la paleta oficial y remapea los tokens del starter, así que
     * todo lo que queda adentro se reskinea sin tocar globals.css.
     */
    <div className={styles.shell}>
      <GenerativeUI />
      <AppControl workplace={workplace} />
      <main className="ck-workspace">
        {/* Encabezado compacto: esto es una mesa de trabajo, no una portada. */}
        <header className="ck-workspace-header">
          <div>
            <p className="ck-eyebrow">Breakfast of Champions · Decision Desk</p>
            <h1>Decisión del equipo</h1>
          </div>
          <span className="ck-tag">Caso de demo</span>
        </header>

        <div className={styles.grid}>
          <div className={styles.deskColumn}>
            <DecisionDesk workplace={workplace} />
          </div>

          <div className={styles.chatColumn}>
            <section
              className="ck-panel ck-assistant"
              aria-labelledby="assistant-title"
            >
              <header className="ck-assistant-header">
                <h2 id="assistant-title">Facilitador</h2>
                <p>
                  Encuentra huecos, adjunta evidencia investigada y deja
                  compromisos listos para tu aprobación. No puede crear nada por
                  su cuenta.
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
        </div>
      </main>
    </div>
  );
}
