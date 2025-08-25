# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c70a66f5-5dc4-48f7-abe1-845087595575

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c70a66f5-5dc4-48f7-abe1-845087595575) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Configuração do QR Code

O QR code gerado nos crachás aponta para a imagem oficial "Não Conforme" localizada em:
```
public/assets/nao-conforme-oficial2.png
```

Este arquivo deve ser servido como arquivo estático (não como módulo TypeScript) para garantir acesso público via URL.

### Personalização da URL do QR

Você pode personalizar a URL do QR code definindo a variável de ambiente:
```bash
VITE_QR_TARGET_URL=https://exemplo.com/sua-imagem-customizada.png
```

Se não definida, o QR apontará automaticamente para:
```
${window.location.origin}/assets/nao-conforme-oficial2.png
```

Após o deploy, a imagem deve estar acessível em:
```
https://growing-badges.lovable.app/assets/nao-conforme-oficial2.png
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c70a66f5-5dc4-48f7-abe1-845087595575) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Histórico de Crachás Emitidos

Este projeto agora registra automaticamente todas as emissões de crachás (downloads e impressões) em um banco de dados Supabase para fins de auditoria e relatórios.

### Configuração da Base de Dados

A estrutura necessária está documentada em `docs/sql/badges_printed.sql`. Se você estiver configurando um novo projeto, execute esse SQL no Supabase SQL Editor.

### Página Administrativa de Relatórios

Acesse `/admin/prints` para visualizar:
- KPIs (total emitidos, emitidos hoje, últimos 7 dias)
- Lista filtrável com busca por nome e intervalo de datas
- Export CSV dos resultados
- Atualização automática a cada 5 segundos

### Configuração de Senha Administrativa

Para proteger a página de relatórios, defina a variável de ambiente:
```
VITE_ADMIN_PASSWORD=sua_senha_aqui
```

Se não definida, a senha padrão será `admin123`.

### Funcionalidades Implementadas

- **Registro automático**: Cada download/impressão é registrado sem interromper o fluxo normal
- **Detecção de origem da foto**: Identifica se a foto veio do Supabase via URL ou foi enviada localmente
- **Proteção por senha**: Interface administrativa protegida por sessão
- **Relatórios em tempo real**: Dados atualizados automaticamente
- **Export de dados**: Funcionalidade completa de exportação CSV
