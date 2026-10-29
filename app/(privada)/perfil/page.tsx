"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import SectionHeader from "../../components/SectionHeader";
import TextField from "../../components/TextField";
import Toast from "../../components/Toast";
import { apiFetch } from "@/lib/api";

// Formato do usuário, igual ao que o GET /users/me devolve
type Usuario = {
  id: number;
  name: string;
  email: string;
  personType: "FISICA" | "JURIDICA";
  cpf: string | null;
  birthDate: string | null;
  cnpj: string | null;
  legalName: string | null;
  phone: string | null;
};

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erro, setErro] = useState("");

  // Campos editáveis de "Meus dados"
  const [dados, setDados] = useState({ name: "", email: "", phone: "", birthDate: "", legalName: "" });
  const [erroDados, setErroDados] = useState("");
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [aviso, setAviso] = useState<string | null>(null);

  // Busca o usuário logado e preenche o formulário com os dados atuais
  async function carregar() {
    try {
      const u: Usuario = await apiFetch("/users/me");
      setUsuario(u);
      setDados({
        name: u.name,
        email: u.email,
        phone: u.phone ?? "",
        birthDate: u.birthDate ? u.birthDate.slice(0, 10) : "",
        legalName: u.legalName ?? "",
      });
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // Atualiza um campo de "Meus dados" mantendo os outros
  function atualizar(campo: keyof typeof dados, valor: string) {
    setDados({ ...dados, [campo]: valor });
  }

  // Envia só os campos que fazem sentido para o tipo de pessoa
  async function salvarDados(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuario) return;
    setErroDados("");

    if (dados.name.trim().length < 3) {
      setErroDados("O nome precisa ter pelo menos 3 caracteres");
      return;
    }

    const isFisica = usuario.personType === "FISICA";
    const corpo = {
      name: dados.name.trim(),
      email: dados.email.trim(),
      phone: dados.phone.trim(),
      // A API só aceita data de nascimento para PF e razão social para PJ
      ...(isFisica && dados.birthDate ? { birthDate: dados.birthDate } : {}),
      ...(!isFisica && dados.legalName.trim() ? { legalName: dados.legalName.trim() } : {}),
    };

    setSalvandoDados(true);
    try {
      await apiFetch("/users/me", { method: "PUT", body: JSON.stringify(corpo) });
      setAviso("Dados salvos");
      await carregar();
    } catch (e) {
      // Ex.: 409 quando o e-mail já é de outra pessoa
      setErroDados((e as Error).message);
    } finally {
      setSalvandoDados(false);
    }
  }

  // Enquanto a API não respondeu, não desenha o formulário
  if (!usuario) {
    return erro ? <p className="fc-field-msg fc-field-msg-error">{erro}</p> : null;
  }

  const isFisica = usuario.personType === "FISICA";

  return (
    <div className="fc-page">
      <SectionHeader
        level="page"
        icon="user"
        eyebrow="Conta"
        title="Perfil"
        description="Seus dados, sua senha e a exclusão da conta."
      />

      <div className="fc-two">
        {/* Meus dados */}
        <section className="fc-panel">
          <SectionHeader icon="user" title="Meus dados" description={isFisica ? "Pessoa física" : "Pessoa jurídica"} />

          <form className="fc-form" onSubmit={salvarDados} noValidate>
            <TextField label="Nome" value={dados.name} onChange={(e) => atualizar("name", e.target.value)} />
            <TextField label="E-mail" type="email" value={dados.email} onChange={(e) => atualizar("email", e.target.value)} />

            <div className="fc-form-row">
              <TextField
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={dados.phone}
                onChange={(e) => atualizar("phone", e.target.value)}
              />
              {isFisica ? (
                <TextField label="Nascimento" type="date" value={dados.birthDate} onChange={(e) => atualizar("birthDate", e.target.value)} />
              ) : (
                <TextField label="Razão social" value={dados.legalName} onChange={(e) => atualizar("legalName", e.target.value)} />
              )}
            </div>

            {/* Documento travado: só aparece, não pode ser editado */}
            <TextField label={isFisica ? "CPF" : "CNPJ"} value={(isFisica ? usuario.cpf : usuario.cnpj) ?? ""} disabled />
            <p className="fc-hint">Não pode ser alterado depois do cadastro.</p>

            {erroDados && <p className="fc-field-msg fc-field-msg-error">{erroDados}</p>}

            <div>
              <Button type="submit" icon="check" disabled={salvandoDados}>
                {salvandoDados ? "Salvando..." : "Salvar dados"}
              </Button>
            </div>
          </form>
        </section>

        {/* Lado direito: senha e exclusão (próximas partes) */}
        <div className="fc-page" style={{ gap: "var(--space-6)" }}></div>
      </div>

      {aviso && <Toast message={aviso} onClose={() => setAviso(null)} />}
    </div>
  );
}