export function SetupRequired() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="setup-mark">F</div>
        <p className="auth-kicker">Femmea</p>
        <h1>Conecte o Supabase para começar</h1>
        <p>
          O app já está preparado. Copie <code>.env.example</code> para <code>.env.local</code>,
          preencha a URL e a chave publicável do projeto e aplique as migrations SQL.
        </p>
        <div className="setup-code">
          NEXT_PUBLIC_SUPABASE_URL=...<br />
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
        </div>
      </section>
    </main>
  );
}
