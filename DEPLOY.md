# 🚀 Como Publicar no Vercel

## Método 1: Deploy via Interface Web (Recomendado para Iniciantes)

### Passo 1: Criar Conta no Vercel
1. Acesse: https://vercel.com/signup
2. Faça login com sua conta GitHub, GitLab ou Bitbucket (recomendado GitHub)

### Passo 2: Enviar Código para o GitHub

#### Se você ainda não tem um repositório GitHub:

**A. Criar repositório no GitHub:**
1. Acesse: https://github.com/new
2. Nome do repositório: `ultimate-tic-tac-toe`
3. Deixe como **público** ou **privado** (ambos funcionam)
4. **NÃO** marque "Initialize with README" (já temos um)
5. Clique em "Create repository"

**B. Conectar seu projeto ao GitHub:**

No terminal do VS Code (PowerShell), execute:

```powershell
# Adicionar repositório remoto (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/ultimate-tic-tac-toe.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

**Exemplo:**
```powershell
git remote add origin https://github.com/joaosilva/ultimate-tic-tac-toe.git
git branch -M main
git push -u origin main
```

### Passo 3: Deploy no Vercel

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório `ultimate-tic-tac-toe`
4. Configure (geralmente não precisa mudar nada):
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: .next (padrão)
5. Clique em "Deploy"

🎉 **Pronto!** Em 1-2 minutos seu site estará online!

Você receberá uma URL como: `https://ultimate-tic-tac-toe-xyz.vercel.app`

---

## Método 2: Deploy via CLI (Para Usuários Avançados)

### Passo 1: Instalar Vercel CLI

```powershell
npm install -g vercel
```

### Passo 2: Fazer Login

```powershell
vercel login
```

Siga as instruções no terminal para autenticar.

### Passo 3: Deploy

No diretório do projeto:

```powershell
cd "c:\Users\Usuario\Documents\0_ UTFPR\OUTROS\Projeto\ultimate-tic-tac-toe"
vercel
```

Responda as perguntas:
- Set up and deploy? **Y**
- Which scope? Selecione seu usuário
- Link to existing project? **N**
- What's your project's name? **ultimate-tic-tac-toe**
- In which directory is your code located? **./**

O Vercel irá:
1. Detectar automaticamente que é um projeto Next.js
2. Fazer o build
3. Fazer o deploy
4. Fornecer a URL de produção

### Deploy de Produção

```powershell
vercel --prod
```

---

## Método 3: Deploy Manual via Vercel Dashboard

### Passo 1: Fazer Build Local

```powershell
cd "c:\Users\Usuario\Documents\0_ UTFPR\OUTROS\Projeto\ultimate-tic-tac-toe"
npm run build
```

### Passo 2: Criar arquivo vercel.json (opcional)

O Next.js já está configurado, mas você pode adicionar configurações extras se necessário.

### Passo 3: Upload via Dashboard

1. Acesse: https://vercel.com/dashboard
2. Clique em "Add New..." → "Project"
3. Se não quiser usar Git, clique em "Deploy without Git"
4. Faça upload da pasta do projeto (não precisa incluir `node_modules`)

---

## ⚙️ Configurações Importantes

### Variáveis de Ambiente (se necessário no futuro)

No dashboard do Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione suas variáveis (exemplo: API keys)

### Domínio Customizado

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure o DNS conforme instruções

---

## 🔄 Atualizações Automáticas

Após o deploy inicial via GitHub:

**Toda vez que você fizer:**
```powershell
git add .
git commit -m "Suas alterações"
git push
```

O Vercel irá automaticamente:
1. Detectar o push
2. Fazer build
3. Fazer deploy
4. Atualizar o site

---

## 📊 Monitoramento

Após o deploy, você pode monitorar:
- **Analytics**: Visualizações, performance
- **Logs**: Ver logs de build e runtime
- **Deployments**: Histórico de deploys

---

## 🐛 Solução de Problemas

### Erro de Build

Se o build falhar:
1. Verifique os logs no Vercel Dashboard
2. Teste o build localmente: `npm run build`
3. Corrija erros e faça novo push

### Erro 404 em Rotas

Next.js App Router funciona automaticamente no Vercel. Não precisa configuração extra.

### Build Muito Lento

O Vercel tem limites de build time no plano gratuito (veja documentação).

---

## 💰 Custos

**Plano Gratuito (Hobby):**
- ✅ Deploy ilimitado
- ✅ 100 GB bandwidth/mês
- ✅ Domínio .vercel.app gratuito
- ✅ Certificado SSL automático
- ✅ Ideal para projetos pessoais

**Planos Pagos:**
- Pro: $20/mês (projetos profissionais)
- Enterprise: Customizado

---

## 📝 Checklist Final

Antes de fazer deploy:

- [x] ✅ Código sem erros: `npm run build`
- [x] ✅ Tipos TypeScript corretos
- [x] ✅ Git commit feito
- [ ] ✅ Repositório GitHub criado
- [ ] ✅ Código enviado para GitHub: `git push`
- [ ] ✅ Deploy no Vercel
- [ ] ✅ Testar site online
- [ ] ✅ Compartilhar URL! 🎉

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação Vercel**: https://vercel.com/docs
- **Next.js no Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Suporte**: https://vercel.com/support

---

## 🎯 Resumo Rápido (Caminho Mais Simples)

```powershell
# 1. Commit do código
git add -A
git commit -m "Ready for deploy"

# 2. Criar repositório no GitHub
# Acesse: https://github.com/new

# 3. Conectar e enviar (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/ultimate-tic-tac-toe.git
git branch -M main
git push -u origin main

# 4. Deploy no Vercel
# Acesse: https://vercel.com/new
# Selecione seu repositório → Deploy
```

**Tempo estimado**: 5-10 minutos ⏱️

**Resultado**: Site online em `https://seu-projeto.vercel.app` 🚀

---

## ⚠️ IMPORTANTE: Multiplayer Online

O multiplayer funciona **100% na Vercel** sem precisar de servidor externo! 🎉

### Como funciona:

- **Desenvolvimento local**: Use `npm run dev` para iniciar com `server.js` (portas 3000 e 3001)
- **Produção na Vercel**: Socket.io funciona automaticamente via API Route `/api/socketio`

### Não precisa configurar nada extra!

Basta fazer o deploy na Vercel e o multiplayer funcionará automaticamente.

**Nota**: O Socket.io na Vercel usa **serverless functions**, então o estado do jogo é mantido apenas enquanto há jogadores conectados. Se todos desconectarem, o jogo é perdido (comportamento normal para apps serverless).
