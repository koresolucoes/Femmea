export const FAQ_ITEMS = [
  ["O que é inseminação?", "Uma técnica de reprodução assistida. O Femmea ajuda você a organizar as etapas e as orientações recebidas."],
  ["Como funciona o procedimento?", "A jornada envolve etapas de preparo, acompanhamento e um procedimento programado pela equipe responsável."],
  ["Quais são as chances de sucesso?", "As chances variam de pessoa para pessoa. Use o app para organizar sua jornada e converse com sua equipe sobre expectativas individuais."],
  ["Quais são os possíveis efeitos colaterais?", "Registre como você se sente e procure orientação profissional quando algo preocupar você."],
  ["Quando fazer o teste de gravidez?", "Siga a data indicada pela equipe que acompanha você e use o lembrete do Femmea para não precisar contar os dias."],
  ["Preciso de repouso?", "Siga as recomendações específicas recebidas para o seu caso."],
  ["A inseminação dói?", "A experiência é individual. Se houver dor importante ou algo fora do esperado, procure orientação profissional."],
] as const;

export function FaqList() {
  return <section className="faq-list">{FAQ_ITEMS.map(([question, answer], index) => <details className="faq-item" key={question}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><b aria-hidden="true">+</b></summary><div className="faq-answer"><div><p>{answer}</p></div></div></details>)}</section>;
}
