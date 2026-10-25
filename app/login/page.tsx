"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/Button";
import Icon from "../components/Icon";
import TextField from "../components/TextField";
import { API_URL } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  // Estado = valores que quando mudam fazem a tela ser desenhada de novo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // impede o navegador de recarregar a página ao enviar o formulário
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        if (resposta.status === 401) {
          setErro("E-mail ou senha incorretos.");
        } else {
          setErro(Array.isArray(dados.message) ? dados.message[0] : dados.message);
        }
        return;
      }

      saveToken(dados.access_token);
      router.replace("/painel");
    } catch {
      setErro("Não foi possível conectar à API. Confira se o backend está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="fc-auth">
      <div className="fc-logo">
        <span className="fc-logo-mark">
          <Icon name="coins" />
        </span>
        financeControl
      </div>

      <form onSubmit={handleSubmit} className="fc-card fc-auth-card">
        <div>
          <h1 className="fc-auth-title">Entrar</h1>
          <p className="fc-auth-desc">Acesse suas contas, movimentações e metas.</p>
        </div>

        <TextField
          label="E-mail"
          type="email"
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {erro && (
          <p className="fc-field-msg fc-field-msg-error">
            <Icon name="alert" size={14} />
            {erro}
          </p>
        )}

        <Button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </Button>

        <p className="fc-auth-foot">
          Ainda não tem cadastro? <Link href="/cadastro" className="fc-link">Criar conta</Link>
        </p>
      </form>
    </main>
  );
}