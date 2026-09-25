# MultiLínguas

Plataforma educacional para prática de idiomas, tradução contextual e acompanhamento da evolução dos estudantes.

> **Status:** concepção e definição do MVP.

## 1. Visão geral

O MultiLínguas será um ecossistema educacional que combina prática de conversação, tradução entre idiomas e acompanhamento pedagógico. A primeira versão será construída como uma aplicação web com backend em Node.js e persistência em MySQL, evoluindo gradualmente para uma experiência completa de aprendizagem.

## 2. Concepção do produto

### 2.1 Declaração do problema

Estudantes e entusiastas de idiomas têm dificuldade para praticar conversação com segurança, receber feedback e acompanhar a própria evolução. Ao mesmo tempo, professores e instituições de ensino precisam de informações organizadas sobre participação, vocabulário e desempenho das turmas.

### 2.2 Objetivo do produto

Desenvolver uma plataforma multilíngue que permita ao estudante praticar idiomas em um ambiente seguro, receber traduções e avaliações de nível, enquanto professores e gestores acompanham indicadores pedagógicos por meio de relatórios.

### 2.3 Proposta de valor

- **Para o estudante:** prática acessível, tradução contextual e acompanhamento da evolução.
- **Para o professor ou gestor:** visão consolidada do desempenho e do vocabulário trabalhado pela turma.
- **Para a instituição:** ferramenta centralizada para apoiar atividades pedagógicas de idiomas.

## 3. Público-alvo e perfis de usuário

### Estudante / aprendiz

- Cria uma conta e informa sua faixa etária.
- Realiza uma pré-avaliação de nível.
- Participa de conversas e atividades em outros idiomas.
- Consulta traduções e salva termos em um dicionário pessoal.
- Acompanha seu histórico e sua evolução.

### Professor / gestor escolar

- Acompanha estudantes vinculados à instituição ou à turma.
- Visualiza participação, evolução e vocabulário praticado.
- Consulta e exporta relatórios pedagógicos.

### Administrador do sistema

- Gerencia idiomas, usuários, planos e configurações da plataforma.
- Modera conteúdo e denúncias do chat.
- Administra permissões e indicadores gerais do sistema.

## 4. Escopo do MVP

### 4.1 O que o sistema faz

1. **Cadastro e autenticação**
   - Cadastro de estudantes, professores e administradores.
   - Login e encerramento de sessão.
   - Verificação de faixa etária, com fluxos específicos para usuários de **8 a 14 anos** e adultos.
   - Controle de permissões por perfil.

2. **Perfil e preferências linguísticas**
   - Idioma nativo, idioma de estudo e nível informado.
   - Preferências de privacidade e segurança.
   - Histórico básico de atividades.

3. **Pré-avaliação de nível**
   - Questionário inicial para estimar o nível do estudante.
   - Registro do resultado.
   - Testes periódicos para comparação da evolução.

4. **Tradução multilíngue**
   - Tradução de textos entre idiomas suportados.
   - Exibição do idioma original e do resultado traduzido.
   - Registro do histórico de traduções do usuário.

5. **Chat educacional**
   - Conversas entre usuários autorizados.
   - Respostas rápidas e sugestões de contatos.
   - Filtro inicial de vocabulário inadequado.
   - Denúncia e bloqueio de conteúdo ou usuário.
   - Cuidados adicionais para proteger menores de idade.

6. **Dicionário personalizado**
   - Salvamento de palavras e expressões.
   - Inclusão de tradução, exemplo e observação pessoal.
   - Consulta e remoção de itens salvos.

7. **Acompanhamento e relatórios**
   - Indicadores de participação, vocabulário e resultados dos testes.
   - Painel do estudante com sua evolução.
   - Painel do professor ou gestor com visão por turma.
   - Relatório básico para instituições parceiras.

8. **Planos de acesso**
   - Plano Gratuito com recursos essenciais.
   - Plano VIP com recursos ampliados, conforme regras definidas pelo administrador.

### 4.2 O que o sistema não faz nesta versão

- Não emite diplomas de graduação.
- Não emite certificados oficiais de proficiência reconhecidos pelo MEC ou por outros órgãos certificadores.
- Não substitui professor, escola ou avaliação formal de proficiência.
- Não realiza tradução presencial simultânea por hardware proprietário.
- Não oferece suporte garantido a dialetos extintos ou idiomas sem dicionário digital disponível.
- Não utiliza inteligência artificial para substituir integralmente a avaliação pedagógica humana.
- Não inclui marketplace, aulas particulares ou sistema completo de pagamentos na primeira entrega.
- Não oferece chamadas de vídeo ou áudio no MVP.

## 5. Requisitos funcionais iniciais

| Código | Requisito |
|---|---|
| RF01 | O sistema deve permitir o cadastro de usuários por perfil. |
| RF02 | O sistema deve autenticar o usuário e controlar suas permissões. |
| RF03 | O sistema deve armazenar a faixa etária de forma segura e aplicar as regras correspondentes. |
| RF04 | O sistema deve permitir realizar e registrar uma pré-avaliação. |
| RF05 | O sistema deve traduzir textos entre os idiomas disponíveis. |
| RF06 | O sistema deve permitir iniciar conversas entre usuários autorizados. |
| RF07 | O sistema deve aplicar filtro e denúncia de conteúdo no chat. |
| RF08 | O sistema deve permitir salvar termos no dicionário pessoal. |
| RF09 | O sistema deve exibir indicadores de evolução ao estudante. |
| RF10 | O sistema deve gerar relatórios para professores e gestores autorizados. |
| RF11 | O administrador deve poder gerenciar idiomas, usuários e planos. |

## 6. Requisitos não funcionais

- **Segurança:** senhas protegidas, autorização por perfil, validação de entradas e proteção de dados de menores.
- **Privacidade:** coleta mínima de dados, consentimento adequado e aderência à LGPD.
- **Disponibilidade:** mensagens de erro claras e tratamento de indisponibilidade do banco ou do serviço de tradução.
- **Desempenho:** respostas das operações comuns em tempo adequado, com paginação para listas e relatórios.
- **Escalabilidade:** separação entre autenticação, usuários, chat, tradução e relatórios para permitir evolução do sistema.
- **Acessibilidade:** interface com linguagem simples, contraste adequado e navegação por teclado.
- **Manutenibilidade:** código organizado, validações centralizadas, documentação das rotas e testes automatizados.

## 7. Fluxos principais do MVP

### Fluxo do estudante

1. Criar conta e informar a faixa etária.
2. Confirmar os dados de acesso.
3. Selecionar idioma de estudo.
4. Realizar a pré-avaliação.
5. Usar o tradutor ou entrar em um chat seguro.
6. Salvar novas palavras no dicionário.
7. Consultar o painel de evolução.

### Fluxo do professor ou gestor

1. Entrar no painel institucional.
2. Selecionar uma turma ou grupo.
3. Visualizar participação, testes e vocabulário.
4. Gerar um relatório pedagógico.

### Fluxo do administrador

1. Acessar o painel administrativo.
2. Gerenciar usuários, idiomas e planos.
3. Analisar denúncias e moderar o chat.
4. Consultar indicadores gerais da plataforma.

## 8. Primeira arquitetura técnica

O repositório atual utiliza **JavaScript**, **Node.js** e **MySQL**. A evolução inicial sugerida é:

- Backend: Node.js com API HTTP REST.
- Banco de dados: MySQL.
- Autenticação: sessões ou tokens com expiração e senha armazenada com hash.
- Integração externa: serviço de tradução configurável, sem acoplar a aplicação a um único fornecedor.
- Organização sugerida:

```text
src/
├── config/          # ambiente e banco de dados
├── controllers/     # entrada e resposta das requisições
├── middlewares/     # autenticação, autorização e validações
├── routes/          # rotas da API
├── services/        # regras de negócio e integrações
├── repositories/    # acesso ao MySQL
└── utils/           # funções auxiliares

docs/
├── escopo.md
└── api.md

tests/
```

### Entidades iniciais

- `usuarios`
- `perfis`
- `idiomas`
- `avaliacoes`
- `resultados_avaliacoes`
- `conversas`
- `mensagens`
- `termos_dicionario`
- `turmas`
- `relatorios`
- `planos_assinatura`

## 9. Entregas planejadas

### Fase 1 — Fundação

- Ajustar configuração do servidor e variáveis de ambiente.
- Criar conexão segura com o MySQL.
- Definir banco, migrations e modelo de usuários.
- Implementar cadastro, login e autorização.

### Fase 2 — Aprendizagem individual

- Implementar idiomas e perfil linguístico.
- Criar pré-avaliação e registro de resultados.
- Criar tradutor e dicionário pessoal.

### Fase 3 — Interação segura

- Criar conversas e mensagens.
- Implementar filtros, denúncias e bloqueios.
- Aplicar regras especiais para menores.

### Fase 4 — Gestão pedagógica

- Criar turmas e vínculos institucionais.
- Implementar dashboards e relatórios.
- Adicionar plano VIP e regras administrativas.

## 10. Critérios de sucesso do MVP

O MVP será considerado funcional quando:

- um estudante conseguir criar conta, realizar a avaliação e consultar sua evolução;
- um usuário conseguir traduzir um texto em um idioma suportado;
- usuários autorizados conseguirem conversar com filtro e denúncia;
- um estudante conseguir salvar e consultar termos do próprio dicionário;
- um professor conseguir visualizar os dados de uma turma;
- um administrador conseguir gerenciar usuários e idiomas;
- dados de autenticação e usuários menores estiverem protegidos;
- as principais rotas possuírem validação, tratamento de erros e testes básicos.

## 11. Riscos e decisões de escopo

- A tradução depende de um serviço externo e pode ter limites de uso, custo ou indisponibilidade.
- O filtro automático do chat não elimina a necessidade de moderação e denúncia.
- Dados de crianças e adolescentes exigem consentimento, minimização e controles específicos.
- A avaliação do aplicativo é uma estimativa educacional e não equivale a uma certificação oficial.
- O MVP prioriza texto e relatórios básicos; recursos de áudio, vídeo e gamificação ficam para versões futuras.

## 12. Próximo passo técnico

A primeira implementação deve substituir o exemplo atual de alunos por uma API inicial de usuários, mantendo o servidor simples até que autenticação, banco de dados e validações estejam definidos. Em seguida, as demais funcionalidades devem ser adicionadas por módulos, sempre respeitando o escopo acima.
