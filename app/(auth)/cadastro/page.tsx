"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import SegmentedControl from "../../components/SegmentedControl";
import TextField from "../../components/TextField";
import { API_URL, apiErrorMessage } from "@/lib/api";
import { saveToken } from "@/lib/auth";

// Valores iniciais do formulário: um campo para cada dado do cadastro
const formularioVazio = {
  personType: "FISICA",
  name: "",
  cpf: "",
  birthDate: "",
  cnpj: "",
  legalName: "",
  email: "",
  password: "",
  confirm: "",
};

type Campo = keyof typeof formularioVazio;
type Erros = Partial<Record<Campo, string>>;

// Deixa só os números de um texto ("123.456.789-00" vira "12345678900")
const somenteNumeros = (texto: string) => texto.replace(/\D/g, "");

export default function CadastroPage() {
  const router = useRouter();

  const [form, setForm] = useState(formularioVazio);
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState("");
  const [carregando, setCarregando] = useState(false);

  const isFisica = form.personType === "FISICA";

  // Atualiza um campo do formulário mantendo os outros como estavam
  function atualizar(campo: Campo, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  // Confere os campos antes de enviar, com as mesmas regras da API
  function validar(): Erros {
    const e: Erros = {};
    if (form.name.trim().length < 3) e.name = "Informe seu nome";
    if (isFisica) {
      if (somenteNumeros(form.cpf).length !== 11) e.cpf = "O CPF tem 11 dígitos";
      if (!form.birthDate) e.birthDate = "Informe a data de nascimento";
    } else {
      if (somenteNumeros(form.cnpj).length !== 14) e.cnpj = "O CNPJ tem 14 dígitos";
      if (!form.legalName.trim()) e.legalName = "Informe a razão social";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Informe um e-mail válido";
    if (form.password.length < 8) e.password = "A senha precisa ter pelo menos 8 caracteres";
    if (form.confirm !== form.password) e.confirm = "As senhas não conferem";
    return e;
  }

  // Monta o corpo da requisição só com os dados do tipo de pessoa escolhido
  function montarCorpo() {
    const base = { name: form.name.trim(), email: form.email, password: form.password, personType: form.personType };
    return isFisica
      ? { ...base, cpf: somenteNumeros(form.cpf), birthDate: form.birthDate }
      : { ...base, cnpj: somenteNumeros(form.cnpj), legalName: form.legalName.trim() };
  }

  // Valida, envia o cadastro para a API e, se der certo, já entra logado
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroApi("");

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarCorpo()),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroApi(apiErrorMessage(dados));
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
        <h2 className="fc-auth-title">Crie sua conta</h2>
        <p className="fc-auth-desc">Pessoa física ou jurídica. Leva menos de um minuto.</p>
      </div>

      {/* Tipo de pessoa: define quais documentos aparecem abaixo */}
      <SegmentedControl
        label="Tipo de pessoa"
        value={form.personType}
        onChange={(valor) => atualizar("personType", valor)}
        options={[
          { value: "FISICA", label: "Pessoa física" },
          { value: "JURIDICA", label: "Pessoa jurídica" },
        ]}
      />

      <TextField label="Nome" placeholder="Seu nome completo" value={form.name}
        onChange={(e) => atualizar("name", e.target.value)} error={erros.name} />

      {/* Documentos: muda conforme o tipo de pessoa */}
      {isFisica ? (
        <div className="fc-form-row">
          <TextField label="CPF" placeholder="000.000.000-00" value={form.cpf}
            onChange={(e) => atualizar("cpf", e.target.value)} error={erros.cpf} />
          <TextField label="Nascimento" type="date" value={form.birthDate}
            onChange={(e) => atualizar("birthDate", e.target.value)} error={erros.birthDate} />
        </div>
      ) : (
        <div className="fc-form-row">
          <TextField label="CNPJ" placeholder="00.000.000/0000-00" value={form.cnpj}
            onChange={(e) => atualizar("cnpj", e.target.value)} error={erros.cnpj} />
          <TextField label="Razão social" value={form.legalName}
            onChange={(e) => atualizar("legalName", e.target.value)} error={erros.legalName} />
        </div>
      )}

      <TextField label="E-mail" type="email" placeholder="voce@email.com" value={form.email}
        onChange={(e) => atualizar("email", e.target.value)} error={erros.email} />
      <TextField label="Senha" type="password" placeholder="Mínimo de 8 caracteres" value={form.password}
        onChange={(e) => atualizar("password", e.target.value)} error={erros.password} />
      <TextField label="Confirmar senha" type="password" value={form.confirm}
        onChange={(e) => atualizar("confirm", e.target.value)} error={erros.confirm} />

      {/* Erro geral, vindo da API (ex.: e-mail ou documento já cadastrado) */}
      {erroApi && (
        <p className="fc-field-msg fc-field-msg-error">
          <Icon name="alert" size={14} />
          {erroApi}
        </p>
      )}

      <Button type="submit" disabled={carregando}>
        {carregando ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}