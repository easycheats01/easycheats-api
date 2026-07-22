# 🚀 Deploy no Render.com (GRATUITO)

## ✅ Você está na tela correta!

### **Passo 1: Conectar o código**

#### **Opção A - Conectar GitHub (Recomendado se você tem conta)**
1. Clique em **"Connect account"** para conectar seu GitHub
2. Autorize o Render a acessar seus repositórios
3. Selecione o repositório do projeto
4. Clique em **"Connect"**

#### **Opção B - Deploy Manual/Público (Mais rápido)**
1. Clique em **"Public Git repository"**
2. **Cole esta URL temporária**: 
   ```
   https://github.com/render-examples/express-hello-world
   ```
   *(Vamos configurar o seu código depois)*

---

### **Passo 2: Configurar o serviço**

Na tela de configuração, preencha:

#### **Informações Básicas:**
- **Name**: `easycheats-api` (ou qualquer nome que preferir)
- **Region**: Escolha o mais próximo do Brasil (ex: Ohio, US East)
- **Branch**: `main` ou `master`
- **Runtime**: `Node`

#### **Build & Deploy:**
- **Build Command**: 
  ```
  npm install
  ```

- **Start Command**: 
  ```
  node server.js
  ```

#### **Plano:**
- Selecione: **Free** (Grátis)
- ⚠️ **Importante**: O plano free "dorme" após 15 minutos de inatividade

---

### **Passo 3: Variáveis de Ambiente**

Antes de criar, role para baixo até **"Environment Variables"** e adicione:

**Clique em "Add Environment Variable":**

| Key | Value |
|-----|-------|
| `ADMIN_PASSWORD` | `EasyCheats@2024` |
| `NODE_ENV` | `production` |

---

### **Passo 4: Criar o serviço**

1. Revise todas as configurações
2. Clique em **"Create Web Service"**
3. Aguarde o deploy (2-5 minutos)
4. O Render vai instalar as dependências e iniciar o servidor

---

### **Passo 5: Obter a URL**

Após o deploy:
1. Você verá uma URL tipo: `https://easycheats-api.onrender.com`
2. Copie esta URL

---

### **Passo 6: Fazer upload do seu código (Importante!)**

Como você usou o repositório de exemplo, precisa fazer upload do seu código:

#### **Via Render Dashboard:**
1. No seu serviço, vá em **"Shell"** (terminal)
2. Ou conecte seu próprio repositório GitHub depois

#### **Criar repositório GitHub (Melhor opção):**

No seu computador, na pasta do projeto:

```powershell
cd "c:\Users\vande\OneDrive\Documents\easy cheats api\easy cheats api"

# Inicializar repositório
git init

# Adicionar arquivos
git add server.js package.json squarecloud.app public/

# Criar commit
git commit -m "Initial commit - EasyCheats API"

# Criar repositório no GitHub:
# 1. Acesse github.com
# 2. Clique em "New repository"
# 3. Nome: easycheats-api
# 4. Público ou Privado
# 5. NÃO marque "Initialize with README"
# 6. Clique em "Create repository"

# Conectar ao GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/easycheats-api.git
git branch -M main
git push -u origin main
```

Depois, no Render:
1. Vá em **Settings** → **Build & Deploy**
2. Clique em **"Connect Repository"**
3. Selecione seu repositório GitHub
4. O Render fará redeploy automaticamente

---

### **Passo 7: Testar a API**

Abra no navegador:
```
https://seu-app.onrender.com/
```

Você deve ver:
```json
{
  "status": "ok",
  "message": "EASYCHEATS API running"
}
```

---

### **Passo 8: Fazer login no painel**

1. Abra o arquivo `painel.html` no navegador
2. No formulário de login:
   - **URL da API**: `https://seu-app.onrender.com`
   - **Senha Admin**: `EasyCheats@2024`
3. Clique em **"Entrar"**

---

## 🎯 **Atalho Rápido - Usar Repositório Público**

Se quiser testar rapidamente SEM criar conta GitHub:

Você pode criar um repositório público rapidamente:

1. Vá em: https://github.com/new
2. Nome: `easycheats-api`
3. Público
4. Não marque nada
5. Crie e faça upload dos arquivos

---

## ⚠️ **Limitações do Plano Free:**

- ✅ Grátis para sempre
- ⚠️ Servidor "dorme" após 15min sem uso (leva ~30s para "acordar")
- ✅ 750 horas/mês (suficiente para uso pessoal)
- ✅ SSL/HTTPS automático
- ✅ Deploy automático via Git

---

## 🆙 **Alternativa: Deploy direto (sem GitHub)**

Infelizmente o Render não permite upload direto de ZIP. Você precisa usar:
1. **GitHub** (melhor opção - free)
2. **GitLab** (alternativa - free)
3. **Render Blueprint** (requer configuração)

---

## 📞 **Problemas?**

- Dashboard Render: https://dashboard.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

---

## ✅ **Próximo passo:**

**Você precisa ter o código no GitHub para o Render funcionar.**

Quer que eu te ajude a:
1. ✅ Criar um repositório GitHub
2. ✅ Fazer upload do código
3. ✅ Conectar ao Render

?
