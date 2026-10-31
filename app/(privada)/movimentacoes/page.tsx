import Movimentacoes from "./Movimentacoes";

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