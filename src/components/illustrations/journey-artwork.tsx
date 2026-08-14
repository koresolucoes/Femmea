export type JourneyArtworkName =
  | "planning"
  | "cycle_monitoring"
  | "insemination_day"
  | "post_procedure"
  | "pregnancy_test"
  | "pregnancy"
  | "reminder";

const artwork: Record<JourneyArtworkName, { src: string; alt: string }> = {
  planning: { src: "/illustrations/journey/planning.svg", alt: "Planejamento da jornada" },
  cycle_monitoring: { src: "/illustrations/journey/cycle-monitoring.svg", alt: "Acompanhamento do ciclo" },
  insemination_day: { src: "/illustrations/journey/insemination-day.svg", alt: "Dia da inseminação" },
  post_procedure: { src: "/illustrations/journey/post-procedure.svg", alt: "Período de espera após o procedimento" },
  pregnancy_test: { src: "/illustrations/journey/pregnancy-test.svg", alt: "Teste de gravidez" },
  pregnancy: { src: "/illustrations/journey/pregnancy.svg", alt: "Mulher grávida" },
  reminder: { src: "/illustrations/journey/reminder.svg", alt: "Lembretes" },
};

export function JourneyArtwork({ name, className = "journey-artwork", decorative = false }: {
  name: JourneyArtworkName;
  className?: string;
  decorative?: boolean;
}) {
  const item = artwork[name];
  return <img className={className} src={item.src} alt={decorative ? "" : item.alt} aria-hidden={decorative || undefined} loading="eager" />;
}
