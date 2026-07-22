# 🚀 Como fazer Deploy na SquareCloud

## Passo 1: Criar conta na SquareCloud
1. Acesse: https://squarecloud.app
2. Crie uma conta ou faça login
3. Adicione créditos via PIX (planos a partir de R$ 5,00)

## Passo 2: Preparar os arquivos
Você precisa enviar estes arquivos:
- ✅ `server.js` (seu código principal)
- ✅ `package.json` (dependências)
- ✅ `squarecloud.app` (configuração)
- ✅ `public/` (pasta com os painéis HTML)
- ⚠️  **NÃO enviar**: `.env`, `node_modules/`, `db.json`

## Passo 3: Criar um ZIP
1. Selecione os seguintes arquivos/pastas:
   - `server.js`
   - `package.json`
   - `squarecloud.app`
   - `public/` (pasta inteira)
   
2. Clique com botão direito → **Enviar para → Pasta compactada (zip)**

3. Nomeie como: `easycheats-api.zip`

## Passo 4: Upload na SquareCloud
1. No dashboard da SquareCloud, clique em **"Novo aplicativo"**
2. Faça upload do arquivo `easycheats-api.zip`
3. Aguarde o deploy ser concluído

## Passo 5: Configurar variáveis de ambiente
No painel da SquareCloud:
1. Vá em **Configurações** → **Variáveis de Ambiente**
2. Adicione:
   ```
   ADMIN_PASSWORD=EasyCheats@2024
   ```

## Passo 6: Obter a URL da sua API
Após o deploy, a SquareCloud fornecerá uma URL tipo:
```
https://seu-app.squareweb.app
```

## Passo 7: Fazer login no painel
1. Abra o arquivo `painel.html` no navegador
2. No login, insira:
   - **URL da API**: `https://seu-app.squareweb.app`
   - **Senha Admin**: `EasyCheats@2024`

---

## 🔧 Configuração atual do squarecloud.app

```
DISPLAY_NAME=EASYCHEATS
MAIN=server.js
MEMORY=256
VERSION=recommended
START=node server.js
PORT=80
PERSISTENT_VOLUMES=/data
```

Esta configuração está pronta para uso!

---

## 📞 Suporte
- Discord SquareCloud: https://discord.gg/squarecloud
- Documentação: https://docs.squarecloud.app
