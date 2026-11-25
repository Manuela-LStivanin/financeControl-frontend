import Movimentacoes from "./Movimentacoes";

// [LOCAL] Rota /movimentacoes: lê o ?accountId= do endereço e abre a tela já filtrada
// Página da rota /movimentacoes. Roda no servidor só para ler o endereço:
// em /movimentacoes?accountId=5, entrega "5" para a tela já abrir filtrada por essa conta.
export default async function MovimentacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const { accountId } = await searchParams;
  return <Movimentacoes contaInicial={accountId ?? ""} />;
}