// Funções de formatação de valores em dinheiro, no padrão brasileiro

const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// [LOCAL] Formatação de dinheiro (formatBRL), leitura do valor digitado (parseBRL) e datas (formatDate)
// 1500.5 vira "R$ 1.500,50"
export function formatBRL(valor: number | string): string {
  return reais.format(Number(valor) || 0);
}

// Lê o que a pessoa digitou ("1.250,90") e devolve um número (1250.9).
// Devolve NaN quando o texto não é um valor válido.
export function parseBRL(texto: string): number {
  let limpo = texto.replace(/\s|R\$/g, "");
  // Com vírgula: a vírgula é o decimal e os pontos são milhar ("1.250,90").
  // Sem vírgula: o ponto é o decimal ("12.50"), como no teclado numérico.
  if (limpo.includes(",")) limpo = limpo.replace(/\./g, "").replace(",", ".");
  if (limpo === "" || !/^-?\d+(\.\d{1,2})?$/.test(limpo)) return NaN;
  return Number(limpo);
}

//formata uma data da API no padrão brasileiro: "2027-12-31T00:00:00.000Z" vira "31/12/2027"
// O timeZone "UTC" evita mostrar um dia a menos por causa do fuso do Brasil
export function formatDate(data: string | Date): string {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}