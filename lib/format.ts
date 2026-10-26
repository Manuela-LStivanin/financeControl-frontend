// Formata uma data da API para o padrão brasileiro: "2027-12-31T00:00:00.000Z" vira "31/12/2027"
export function formatDate(data: string | Date): string {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}