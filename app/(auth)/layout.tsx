import Icon from "../components/Icon";
import AuthTabs from "./AuthTabs";

// Moldura das telas de login e cadastro: painel da marca à esquerda
// e, à direita, as abas "Entrar | Criar conta" com o formulário da página atual
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="fc-auth">
      {/* Painel azul com a apresentação do produto */}
      <aside className="fc-auth-side">
        <div className="fc-logo">
          <span className="fc-logo-mark">
            <Icon name="coins" />
          </span>
          financeControl
        </div>

        <div>
          <h1 className="fc-auth-hero">
            Seu dinheiro,
            <br />
            organizado.
          </h1>
          <p className="fc-auth-sub">
            Contas, movimentações, categorias e metas em um só lugar. O saldo se atualiza sozinho a cada lançamento.
          </p>
        </div>

        <ul className="fc-auth-points">
          <li><Icon name="wallet" size={18} />Todas as contas bancárias juntas</li>
          <li><Icon name="swap" size={18} />Entradas e saídas por categoria</li>
          <li><Icon name="target" size={18} />Metas com progresso e prazo</li>
        </ul>
      </aside>

      {/* Formulário: muda conforme a página (login ou cadastro) */}
      <main className="fc-auth-main">
        <div className="fc-auth-form">
          <AuthTabs />
          {children}
        </div>
      </main>
    </div>
  );
}