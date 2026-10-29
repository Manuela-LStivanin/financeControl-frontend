"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // NOVO
import Button from "../../components/Button";
import Modal from "../../components/Modal"; // NOVO
import SectionHeader from "../../components/SectionHeader";
import TextField from "../../components/TextField";
import Toast from "../../components/Toast";
import { apiFetch } from "@/lib/api";
import { clearToken } from "@/lib/auth"; // NOVO

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

// Campos do formulário de senha, todos começando vazios
const senhaVazia = { atual: "", nova: "", confirmar: "" };
type ErrosSenha = Partial<Record<keyof typeof senhaVazia, string>>;

export default function PerfilPage() {
  const router = useRouter(); // NOVO
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erro, setErro] = useState("");

  // Campos editáveis de "Meus dados"
  const [dados, setDados] = useState({ name: "", email: "", phone: "", birthDate: "", legalName: "" });
  const [erroDados, setErroDados] = useState("");
  const [salvandoDados, setSalvandoDados] = useState(false);

  // Formulário de troca de senha
  const [senha, setSenha] = useState(senhaVazia);
  const [errosSenha, setErrosSenha] = useState<ErrosSenha>({});
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // NOVO: exclusão da conta
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [palavra, setPalavra] = useState(""); // o que a pessoa digitou
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

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

  // Confere os campos e troca a senha na API
  async function trocarSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const e: ErrosSenha = {};
    if (!senha.atual) e.atual = "Informe a senha atual";
    if (senha.nova.length < 8) e.nova = "A nova senha precisa ter pelo menos 8 caracteres";
    if (senha.confirmar !== senha.nova) e.confirmar = "As senhas não conferem";
    setErrosSenha(e);
    if (Object.keys(e).length > 0) return;

    setSalvandoSenha(true);
    try {
      await apiFetch("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: senha.atual, newPassword: senha.nova }),
      });
      setSenha(senhaVazia); // limpa os campos depois de trocar
      setAviso("Senha alterada");
    } catch (erro) {
      // Ex.: 400 "Senha atual incorreta"
      setErrosSenha({ atual: (erro as Error).message });
    } finally {
      setSalvandoSenha(false);
    }
  }

  // NOVO: abre a confirmação sempre com o campo vazio
  function abrirExclusao() {
    setPalavra("");
    setErroExclusao("");
    setConfirmandoExclusao(true);
  }

  // NOVO: apaga a conta na API, apaga o token e volta para o login
  async function apagarConta() {
    setExcluindo(true);
    try {
      await apiFetch("/users/me", { method: "DELETE" });
      clearToken();
      router.replace("/login");
    } catch (e) {
      setErroExclusao((e as Error).message);
      setExcluindo(false);
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

        {/* Lado direito: senha e exclusão */}
        <div className="fc-page" style={{ gap: "var(--space-6)" }}>
          {/* Trocar senha */}
          <section className="fc-panel">
            <SectionHeader icon="lock" title="Trocar senha" />

            <form className="fc-form" onSubmit={trocarSenha} noValidate>
              <TextField
                label="Senha atual"
                type="password"
                value={senha.atual}
                onChange={(e) => setSenha({ ...senha, atual: e.target.value })}
                error={errosSenha.atual}
              />
              <div className="fc-form-row">
                <TextField
                  label="Nova senha"
                  type="password"
                  value={senha.nova}
                  onChange={(e) => setSenha({ ...senha, nova: e.target.value })}
                  error={errosSenha.nova}
                />
                <TextField
                  label="Confirmar"
                  type="password"
                  value={senha.confirmar}
                  onChange={(e) => setSenha({ ...senha, confirmar: e.target.value })}
                  error={errosSenha.confirmar}
                />
              </div>
              <div>
                <Button type="submit" variant="secondary" disabled={salvandoSenha}>
                  {salvandoSenha ? "Alterando..." : "Alterar senha"}
                </Button>
              </div>
            </form>
          </section>

          {/* NOVO: apagar a conta */}
          <section className="fc-panel fc-panel-danger">
            <SectionHeader
              icon="alert"
              title="Apagar minha conta"
              description="Remove você, suas contas bancárias, movimentações, categorias e metas."
            />
            <div>
              <Button variant="danger" icon="trash" onClick={abrirExclusao}>
                Apagar minha conta
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* NOVO: confirmação de exclusão, com a palavra APAGAR */}
      <Modal
        open={confirmandoExclusao}
        title="Apagar sua conta?"
        onClose={() => setConfirmandoExclusao(false)}
        width={460}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmandoExclusao(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger-solid"
              icon="trash"
              onClick={apagarConta}
              disabled={palavra !== "APAGAR" || excluindo}
            >
              {excluindo ? "Apagando..." : "Apagar tudo"}
            </Button>
          </>
        }
      >
        <p>
          Isso apaga <strong>todas as suas contas, movimentações, categorias e metas</strong>. Não dá para desfazer.
        </p>
        <TextField
          label="Digite APAGAR para confirmar"
          value={palavra}
          onChange={(e) => setPalavra(e.target.value)}
          error={erroExclusao}
          autoFocus
        />
      </Modal>

      {aviso && <Toast message={aviso} onClose={() => setAviso(null)} />}
    </div>
  );
}