# Endo OREN.AI — Chamsa Suite

Plataforma de geração, edição e gestão de laudos endoscópicos digestivos com assistência de IA.

---

## Visão Geral

O **Endo OREN.AI** é uma aplicação web voltada a endoscopistas que precisam emitir laudos de EDA (Endoscopia Digestiva Alta) de forma rápida, padronizada e com terminologia médica refinada. O sistema permite selecionar um paciente, registrar achados estruturados por segmento anatômico (esôfago, estômago e duodeno), anexar procedimentos realizados, e gerar automaticamente um laudo narrativo pronto para impressão, cópia ou salvamento. Uma camada de IA ("Dr. Chamsa") otimiza o texto do laudo e oferece diretrizes customizáveis por administrador.

O projeto é multiusuário, com autenticação própria, painel administrativo para configuração global de IA e gestão de diretrizes (skills), e backend customizado em Node.js sobre PostgreSQL/Supabase.

---

## Stack Tecnológica

**Frontend**
- React 18 + Vite 6
- Tailwind CSS 3 + shadcn/ui (componentes Radix UI)
- React Router DOM 6 (roteamento protegido)
- TanStack React Query (estado de dados/cache)
- Framer Motion (animações)
- Lucide React (iconografia)
- jsPDF / html2canvas (exportação e impressão)

**Backend**
- Node.js (servidor customizado em `http://localhost:3000`)
- Express-style API REST sob `/api`
- PostgreSQL via `pg` + Supabase (`@supabase/supabase-js`)
- Autenticação JWT (`jsonwebtoken`) com hash de senha (`bcryptjs`)
- Integração com Mistral AI (e modelos alternativos) via `https` nativo

**Ferramentas / Dev**
- ESLint 9 + plugins React/Hooks
- TypeScript (apenas typecheck, base JS)
- Postgres como fonte de verdade para dados clínicos e configurações

---

## Funcionalidades Implementadas

- **Login / Cadastro / Recuperação de senha** com sessão JWT persistida em `localStorage`.
- **Editor de laudo endoscópico** (`EndoReport`) com seções estruturadas:
  - Identificação do paciente e indicação clínica (com indicações customizadas).
  - Esôfago: neoplasia, esofagite (Los Angeles), hérnia hiatal, varizes, Barrett (Praga), eosinofílica, candidíase (Kodsi), estenose, úlcera, divertículo, Mallory-Weiss.
  - Estômago: neoplasia (Borrmann), gastrite, atrofia (Kimura-Takemoto), metaplasia, Sydney/OLGA, pólipos (Paris), lesão subepitelial, urease, xantelasma, GAVE.
  - Duodeno: duodenite, úlcera, doença celíaca (atrofia/mosaico/serrilhado), divertículo.
  - Banco de **procedimentos endoscópicos** (biópsias, hemostasia, ressecção mucosa, etc.).
  - Banco de **esofagites** com manifestação endoscópica detalhada.
- **Gerador de laudo automático** com modo padrão e modo IA (texto mais descritivo).
- **Edição manual do laudo** com bloqueio/confirmar (preserva as alterações).
- **Pré-visualização** com cópia para área de transferência e contador de palavras.
- **Pedido de biópsia** impresso (BiopsyModal) com materiais derivados dos achados.
- **Gestão de pacientes** (`Patients`) com busca, cadastro e cálculo de idade.
- **Detalhe do paciente** (`PatientDetail`) com histórico de laudos.
- **Configurações por médico** (`Settings`): nome/CRM, indicações customizadas, templates de frases.
- **Gerenciador de templates** de conclusões e seções do laudo.
- **Painel Admin** (`Admin`) restrito ao administrador:
  - Configuração global de API Key e modelo de IA.
  - Criação/edição/ativação de **diretrizes (skills) Chamsa** com system prompts customizados.
- **Logout** e proteção de rotas (redirecionamento automático para `/login`).

---

## Entidades (Banco de Dados)

O backend utiliza PostgreSQL (via Supabase) com as seguintes entidades principais:

| Entidade | Descrição |
|---|---|
| **User / Doctor** | Usuários (médicos) com e-mail, senha (hash bcrypt), nome, CRM e role. |
| **Patient** | Pacientes: nome, data de nascimento, CPF, telefone, e-mail, histórico médico, alergias, medicamentos. |
| **Report** | Laudos: `patient_id`, `patient_name`, `indication`, `report_content`, `exam_date`, `findings` (objeto estruturado por segmento), `conclusions` (lista), `biopsy_requested`. |
| **Settings** | Configurações por médico: `doctor_name`, `doctor_crm`, `custom_indications`, `custom_templates`. |
| **Templates** | Templates de frases/conclusões reutilizáveis no editor. |
| **AISettings (Admin)** | Configuração global: `api_key`, `model_name`, `active_skill_id`, `skills[]` (cada skill com `id`, `title`, `system_prompt`, `is_active`). |

Endpoints REST sob `/api`: `/api/auth/*`, `/api/patients`, `/api/reports`, `/api/settings`, `/api/templates`, `/api/admin/settings`, `/api/analyze-report`.

---

## Integrações de IA

- **Dr. Chamsa** — agente de IA que otimiza a redação do laudo. Acionado pelo botão "Modo IA" no editor, refina a terminologia médica e a fluidez do texto descritivo.
- **Modelos suportados** (configuráveis no painel Admin):
  - Mistral: `open-mistral-7b`, `open-mixtral-8x22b`, `mistral-small-2506`, `mistral-medium-latest`.
  - Google: `gemini-1.5-flash`, `gemini-1.5-pro`.
  - OpenAI: `gpt-4o-mini`, `gpt-4o`.
  - Anthropic: `claude-3-5-sonnet-20241022`.
- **Diretrizes (Skills) customizáveis** — o administrador cria system prompts específicos (ex.: protocolo institucional, estilo de redação) e ativa um por vez; a diretriz ativa é injetada em todas as análises de laudo dos médicos.
- A API Key é **global e compartilhada** entre todos os médicos, definida no painel Admin — nenhum médico manipula chaves diretamente.
- As chamadas de IA usam o módulo `https` nativo do Node.js (sem dependências externas pesadas), com tratamento detalhado de erros da Mistral.

---

## Segurança como Ativo de Confiança

- **Autenticação JWT**: tokens assinados no servidor, enviados em cabeçalho `Authorization: Bearer`. Expiração tratada com redirecionamento automático ao login.
- **Senhas com hash bcrypt** — nunca armazenadas em texto plano.
- **Autorização por papel (role)**: rotas protegidas no frontend; o painel Admin é restrito ao e-mail administrador (`clauorenstein@gmail.com`) com bloqueio via `<Navigate>`.
- **Validação de sessão** no carregamento (`/api/auth/me`) — token inválido remove a sessão e força novo login.
- **Isolamento de dados**: cada médico acessa apenas seus próprios pacientes e laudos via escopo de usuário no backend.
- **API Key centralizada** no servidor — nunca exposta ao frontend; o frontend apenas dispara a análise, o backend injeta a credencial.
- **Proteção contra CSRF/abuso**: rotas de mutação exigem token válido; recomenda-se manter HTTPS em produção.

---

## Recomendações de Compliance

- **LGPD (Lei Geral de Proteção de Dados — Brasil)**: o sistema trata dados de saúde (dados pessoais sensíveis). Recomenda-se:
  - Termo de consentimento e política de privacidade visíveis no cadastro.
  - Base legal documentada (tutela da saúde por profissional de saúde).
  - Retenção e descarte de dados definidos por política institucional.
  - Registro de acesso (logs) a laudos e prontuários.
- **CFM**: o laudo é assinado eletronicamente com nome e CRM do médico — garantir que os dados cadastrais estejam corretos e atualizados.
- **Criptografia em trânsito**: uso obrigatório de HTTPS/TLS em produção.
- **Backup**: rotinas de backup do banco PostgreSQL/Supabase com testes de restauração periódicos.
- **Separação de ambientes**: dados de produção isolados de desenvolvimento/testes.
- **Mínimo privilégio**: revisar periodicamente permissões de banco e acessos admin.
- **Auditoria de IA**: como a IA refina laudos, o médico deve revisar e confirmar o conteúdo final antes de salvar (fluxo já implementado via edição manual).

---

## Execução Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL (local ou instância Supabase)
- Chave de API de IA (Mistral, por padrão)

### Passos

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente** (servidor backend)
   - String de conexão PostgreSQL / Supabase
   - `JWT_SECRET`
   - `MISTRAL_API_KEY` (ou chave do provedor escolhido)
   - Credenciais de SMTP (se recuperação de senha por e-mail for habilitada)

3. **Subir o backend** (porta 3000)
   ```bash
   # conforme a configuração do servidor Node na raiz do projeto
   npm run server
   ```

4. **Subir o frontend** (Vite dev server)
   ```bash
   npm run dev
   ```
   O Vite faz proxy de `/api` → `http://localhost:3000` (ver `vite.config.js`).

5. **Acessar** o endereço exibido no terminal (geralmente `http://localhost:5173`).

### Scripts disponíveis
- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — pré-visualização do build
- `npm run lint` / `npm run lint:fix` — análise de código
- `npm run typecheck` — verificação de tipos

---

## Funcionalidades Faltantes / Roadmap

- **Recuperação de senha por e-mail real** — hoje é mockada; integrar SMTP (nodemailer) para envio efetivo.
- **Anexos de imagens/fotos endoscópicas** nos laudos (upload e galeria por exame).
- **Exportação PDF oficial** do laudo (além da impressão do pedido de biópsia).
- **Busca avançada de laudos** com filtros por data, achado, conclusão e paciente.
- **Dashboard/relatórios** com estatísticas (volume de exames, achados mais frequentes).
- **Multi-admin e roles granulares** (hoje o admin é fixado por e-mail).
- **Logs de auditoria** persistentes (quem gerou/editou/salvou cada laudo).
- **Internacionalização (i18n)** — interface hoje em pt-BR.
- **App mobile** (PWA ou nativo) para uso à beira-leito.
- **Integração com sistemas HIS/PACS** (HL7/FHIR) para sincronizar laudos com o prontuário institucional.
- **Assinatura digital certificada (ICP-Brasil)** para validade jurídica do laudo.
- **Treinamento/fine-tuning** de diretrizes Chamsa por especialidade/instituição.

---

> **EndoReport Pro v3.3 — By OrensteinAI**