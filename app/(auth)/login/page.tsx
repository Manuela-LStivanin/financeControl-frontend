"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import TextField from "../../components/TextField";
import { API_URL, apiErrorMessage } from "@/lib/api";
import { saveToken } from "@/lib/auth";

type Erros = { email?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erros, setErros] = useState<Erros>({}); // erros de cada campo
  const [erroApi, setErroApi] = useState(""); // erro devolvido pela API
  const [carregando, setCarregando] = useState(false);

  // Confere os campos antes de enviar; devolve um erro para cada campo inválido
  function validar(): Erros {
    const novosErros: Erros = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) novosErros.email = "Informe um e-mail válido";
    if (!password) novosErros.password = "Informe sua senha";
    return novosErros;
  }

  // Valida, envia o login para a API e, se der certo, guarda o token e abre o painel
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroApi("");

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroApi(resposta.status === 401 ? "E-mail ou senha incorretos." : apiErrorMessage(dados));
        return;
      }

      saveToken(dados.access_token);
      router.replace("/visao-geral");
    } catch {
      setErroApi("Não foi possível conectar à API. Confira se o backend está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="fc-auth-fields">
      <div>
        <h2 className="fc-auth-title">Que bom ver você de novo</h2>
        <p className="fc-auth-desc">Entre para ver suas contas, movimentações e metas.</p>
      </div>

      <TextField
        label="E-mail"
        type="email"
        placeholder="voce@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={erros.email}
      />
      <TextField
        label="Senha"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={erros.password}
      />

      {/* Erro geral, vindo da API */}
      {erroApi && (
        <p className="fc-field-msg fc-field-msg-error">
          <Icon name="alert" size={14} />
          {erroApi}
        </p>
      )}

      <Button type="submit" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}