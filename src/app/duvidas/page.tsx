import Link from "next/link";
import { FaqIllustration } from "@/components/illustrations/faq";
import { FaqList } from "@/components/journey/faq-list";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";

export default async function DuvidasPage() {
  await requireUser();
  return <MobileShell><header className="screen-title-header faq-header"><Link href="/inseminacao?tab=conteudos" className="back-button" aria-label="Voltar">‹</Link><div><div className="journey-brand">Femmea</div><h1>Dúvidas frequentes</h1></div><span className="header-spacer" /></header><section className="faq-hero"><FaqIllustration /><div><span className="stage-kicker">Informação para acolher</span><h2>Respostas para caminhar com mais clareza</h2><p>Abra uma pergunta por vez e continue na mesma tela.</p></div></section><FaqList /></MobileShell>;
}
