"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/Button";
import Icon from "../components/Icon";
import SegmentedControl from "../components/SegmentedControl";
import TextField from "../components/TextField";
import { API_URL, apiErrorMessage } from "@/lib/api";
import { saveToken } from "@/lib/auth";

// Valores iniciais do formulário
const formularioVazio = {
  name: "",
  email: "",
  password: "",
  personType: "FISICA",
  cpf: "",
  birthDate: "",
  cnpj: "",
  legalName: "",
  phone: "",
};

export default function CadastroPage() {
  const router = useRouter();

  // Um único estado guarda o formulário inteiro, como um objeto
  const [form, setForm] = useState(formularioVazio);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const isFisica = form.personType === "FISICA";

  // Atualiza um campo do formulário mantendo os outros como estavam
  function atualizar(campo: keyof typeof formularioVazio, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  // Monta o corpo da requisição só com os dados do tipo de pessoa escolhido
  function montarCorpo() {
    const base = {
      name: form.name,
      email: form.email,
      password: form.password,
      personType: form.personType,
      phone: form.phone || undefined,
    };
    return isFisica
      ? { ...base, cpf: form.cpf, birthDate: form.birthDate }
      : { ...base, cnpj: form.cnpj, legalName: form.legalName };
  }

  // Envia o cadastro para a API; se der certo, já entra logado
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarCorpo()),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(apiErrorMessage(dados));
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
          <h1 className="fc-auth-title">Criar conta</h1>
          <p className="fc-auth-desc">Comece a organizar suas finanças.</p>
        </div>

        {/* Tipo de pessoa: define quais documentos aparecem abaixo */}
        <SegmentedControl
          label="Tipo de pessoa"
          value={form.personType}
          onChange={(valor) => atualizar("personType", valor)}
          options={[
            { value: "FISICA", label: "Pessoa física", icon: "user" },
            { value: "JURIDICA", label: "Pessoa jurídica", icon: "bank" },
          ]}
        />

        {/* Dados comuns aos dois tipos */}
        <TextField label="Nome" value={form.name} onChange={(e) => atualizar("name", e.target.value)} required minLength={3} />
        <TextField label="E-mail" type="email" value={form.email} onChange={(e) => atualizar("email", e.target.value)} required />
        <TextField
          label="Senha"
          type="password"
          placeholder="Mínimo de 8 caracteres"
          value={form.password}
          onChange={(e) => atualizar("password", e.target.value)}
          required
          minLength={8}
        />

        {/* Documentos: muda conforme o tipo de pessoa */}
        {isFisica ? (
          <div className="fc-form-row">
            <TextField label="CPF" placeholder="Só números" value={form.cpf} onChange={(e) => atualizar("cpf", e.target.value)} required />
            <TextField label="Nascimento" type="date" value={form.birthDate} onChange={(e) => atualizar("birthDate", e.target.value)} required />
          </div>
        ) : (
          <>
            <TextField label="Razão social" value={form.legalName} onChange={(e) => atualizar("legalName", e.target.value)} required />
            <TextField label="CNPJ" placeholder="Só números" value={form.cnpj} onChange={(e) => atualizar("cnpj", e.target.value)} required />
          </>
        )}

        <TextField label="Telefone (opcional)" type="tel" value={form.phone} onChange={(e) => atualizar("phone", e.target.value)} />

        {/* Mensagem de erro vinda da API */}
        {erro && (
          <p className="fc-field-msg fc-field-msg-error">
            <Icon name="alert" size={14} />
            {erro}
          </p>
        )}

        <Button type="submit" disabled={carregando}>
          {carregando ? "Criando conta..." : "Criar conta"}
        </Button>

        <p className="fc-auth-foot">
          Já tem cadastro? <Link href="/login" className="fc-link">Entrar</Link>
        </p>
      </form>
    </main>
  );
}