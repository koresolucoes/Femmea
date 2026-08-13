import Link from "next/link";
import { notFound } from "next/navigation";
import { HeartIcon, SparklesIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { CONTENT_LIBRARY } from "@/lib/journey";

type Props = { params: Promise<{ slug: string }> };

const copy: Record<string, { lead: string; sections: { title: string; text: string }[] }> = {
  "o-que-e-inseminacao": {
    lead: "Uma visão geral simples para você entender onde essa etapa se encaixa na sua jornada.",
    sections: [
      { title: "Visão geral", text: "A inseminação intrauterina é um procedimento de reprodução assistida. A indicação, o preparo e o acompanhamento variam conforme o caso e devem ser definidos pela equipe de saúde." },
      { title: "Como usar o Femmea", text: "Registre datas, tarefas, sintomas e lembretes recebidos da sua clínica para manter tudo organizado em um só lugar." },
    ],
  },
  "como-funciona": {
    lead: "Organize as etapas do seu tratamento sem transformar o app em uma fonte de prescrição.",
    sections: [
      { title: "Antes", text: "Cadastre consultas, exames e a data indicada para o procedimento. Use o checklist para registrar o que já foi concluído." },
      { title: "No dia", text: "Confira horário, documentos e orientações fornecidas diretamente pela clínica ou pelo profissional responsável." },
      { title: "Depois", text: "Mantenha lembretes, sintomas e a data de teste indicados pela sua equipe de saúde." },
    ],
  },
  "cuidados-antes": {
    lead: "Um espaço para transformar orientações recebidas em uma rotina organizada.",
    sections: [
      { title: "Organização", text: "Centralize horários, exames, documentos e instruções que você recebeu da equipe responsável." },
      { title: "Sem improviso", text: "Não altere medicações, suplementos ou condutas com base apenas em conteúdo do aplicativo." },
    ],
  },
  "alimentacao-e-rotina": {
    lead: "Bem-estar no app significa registro e organização, não prescrição individualizada.",
    sections: [
      { title: "Rotina", text: "Use metas pessoais, hidratação e lembretes para acompanhar hábitos que você decidiu manter." },
      { title: "Orientação individual", text: "Necessidades alimentares ou de suplementação devem ser avaliadas por profissionais habilitados." },
    ],
  },
  "sinais-e-sintomas": {
    lead: "Registrar como você se sente cria um histórico útil para conversar com sua equipe de saúde.",
    sections: [
      { title: "Registro", text: "Anote sintomas, intensidade, data e observações de contexto para não depender apenas da memória." },
      { title: "Sinais de alerta", text: "O app não classifica urgências. Em caso de sintomas intensos, piora importante ou preocupação, procure orientação profissional adequada." },
    ],
  },
  "duvidas-frequentes": {
    lead: "Respostas curtas sobre o uso do Femmea e sobre a organização da jornada.",
    sections: [
      { title: "O app define minha conduta?", text: "Não. O Femmea ajuda a organizar o que foi definido com sua equipe de saúde." },
      { title: "Posso mudar a data do teste?", text: "Você pode registrar qualquer data no app, mas a data clínica deve seguir a orientação recebida." },
      { title: "Meus dados ficam separados?", text: "A arquitetura usa autenticação e políticas de acesso por usuário no banco de dados." },
    ],
  },
};

export default async function ContentPage({ params }: Props) {
  await requireUser();
  const { slug } = await params;
  const item = CONTENT_LIBRARY.find((content) => content.slug === slug);
  const article = copy[slug];
  if (!item || !article) notFound();

  return (
    <MobileShell>
      <header className="journey-header">
        <Link href="/inseminacao?tab=conteudos" className="back-button" aria-label="Voltar">‹</Link>
        <div className="journey-brand">Femmea</div>
        <span className="header-spacer" />
      </header>

      <article className="article-page">
        <div className="article-icon"><SparklesIcon /></div>
        <span className="stage-kicker">{item.category}</span>
        <h1>{item.title}</h1>
        <p className="article-lead">{article.lead}</p>

        {article.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}

        <aside className="medical-note"><HeartIcon /><p>Conteúdo educativo e organizacional. Não substitui avaliação, diagnóstico ou orientação profissional individual.</p></aside>
      </article>
    </MobileShell>
  );
}
