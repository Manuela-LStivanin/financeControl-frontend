import { clearToken, getToken } from "./auth";

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


// Chama uma rota PRIVADA da API, já com o token.
// Exemplo: const contas = await apiFetch("/accounts");
export async function apiFetch(caminho: string, opcoes: RequestInit = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...opcoes.headers,
    },
  });

  // Token expirado ou inválido: desloga e volta para o login
  if (resposta.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  // Algumas rotas (como os DELETE) respondem sem conteúdo
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  // Outros erros (400, 404, 409...): lança a mensagem da API
  if (!resposta.ok) {
    throw new Error(apiErrorMessage(dados ?? {}));
  }

  return dados;
}