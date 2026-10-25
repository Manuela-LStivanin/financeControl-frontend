// Endereço da API 
//um arquivo para isso porque se o endereço mudar, ele teria que trocar em todas as páginas. 
// Aqui troca num lugar só.
export const API_URL = "http://localhost:3000/api";

// Transforma o corpo de erro da API em uma mensagem só.
// O ValidationPipe devolve "message" como lista (400) e os outros erros, como texto.
export function apiErrorMessage(dados: { message?: string | string[] }): string {
  if (Array.isArray(dados.message)) return dados.message[0];
  return dados.message ?? "Algo deu errado. Tente novamente.";
}