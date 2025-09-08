# ⚙️ Configuração do Ambiente

## 🔑 Variáveis de Ambiente Necessárias

### **Frontend (.env)**
```bash
# URL do backend (ajuste para seu domínio em produção)
REACT_APP_BACKEND_URL=http://localhost:8001

# Para produção, use:
# REACT_APP_BACKEND_URL=https://api.seudominio.com
```

### **Backend (.env)**
```bash
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=temperaments

# Stripe Payment Integration
STRIPE_API_KEY=sk_test_51...  # Sua chave secreta do Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_51...  # Sua chave pública do Stripe

# Frontend URL (para redirects)
FRONTEND_URL=http://localhost:3000

# Para produção:
# FRONTEND_URL=https://seudominio.com
```

## 🏪 Configuração do Stripe

1. **Criar conta no Stripe**: https://dashboard.stripe.com/
2. **Obter as chaves de API**:
   - Dashboard → Developers → API keys
   - Copie a "Secret key" e "Publishable key"
3. **Configurar produto Premium**:
   - Produtos → Criar produto
   - Nome: "Amor & Temperamentos Premium"
   - Preço: $9.97 (pagamento único)

## 💾 Configuração do MongoDB

### **Opção 1: MongoDB Local**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb

# macOS
brew install mongodb-community

# Iniciar serviço
sudo systemctl start mongodb
```

### **Opção 2: MongoDB Atlas (Cloud)**
1. Criar conta: https://cloud.mongodb.com/
2. Criar cluster gratuito
3. Obter connection string
4. Usar no MONGO_URL

## 🌐 Deploy em Produção

### **Opção 1: VPS/Servidor Próprio**
```bash
# 1. Clonar o projeto
git clone <seu-repo>
cd amor-temperamentos

# 2. Executar script de deploy
chmod +x deploy.sh
./deploy.sh

# 3. Configurar variáveis de ambiente
nano frontend/.env
nano backend/.env

# 4. Iniciar em produção
./start_production.sh
```

### **Opção 2: Vercel + Railway**
```bash
# Frontend (Vercel)
vercel --prod

# Backend (Railway)
railway login
railway init
railway up
```

### **Opção 3: Docker**
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]

# Dockerfile.backend
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

## 🔒 Configurações de Segurança

### **Produção - Variáveis Obrigatórias**
```bash
# Backend
SECRET_KEY=<chave-secreta-forte>
ALLOWED_ORIGINS=["https://seudominio.com"]
CORS_ORIGINS=["https://seudominio.com"]

# SSL/HTTPS
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## 📊 Monitoramento

### **Logs**
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs (se usando PM2)
pm2 logs frontend

# Sistema (supervisor)
sudo supervisorctl tail -f backend
sudo supervisorctl tail -f frontend
```

### **Health Checks**
- **Backend**: `GET /health` → `{"status": "ok"}`
- **Frontend**: Página carrega sem erros
- **Database**: Conexão MongoDB ativa
- **Stripe**: Webhook endpoints respondendo

## 🎯 URLs de Produção

### **Essenciais**
- `https://seudominio.com` → Homepage
- `https://seudominio.com/otimizado` → App otimizado
- `https://api.seudominio.com/docs` → Documentação da API
- `https://api.seudominio.com/health` → Status da API

### **Webhook Stripe**
- URL: `https://api.seudominio.com/api/payments/webhook`
- Eventos: `checkout.session.completed`

## 🔄 Backup e Manutenção

### **Backup MongoDB**
```bash
# Backup diário
mongodump --db temperaments --out /backup/$(date +%Y%m%d)/

# Restore
mongorestore --db temperaments /backup/20231207/temperaments/
```

### **Atualizações**
```bash
# Frontend
cd frontend && yarn upgrade
yarn build

# Backend  
cd backend && pip install -r requirements.txt --upgrade
```

## 📞 Suporte Técnico

### **Logs de Erro Comuns**
1. **"CORS Error"** → Verificar ALLOWED_ORIGINS
2. **"MongoDB Connection Failed"** → Verificar MONGO_URL
3. **"Stripe Key Invalid"** → Verificar STRIPE_API_KEY
4. **"Build Failed"** → Verificar dependências Node.js

### **Performance**
- **Frontend**: Usar CDN para assets estáticos
- **Backend**: Configurar Redis para cache
- **Database**: Índices MongoDB otimizados
- **Stripe**: Rate limiting configurado

---

💡 **Dica**: Use o script `deploy.sh` para automatizar a configuração inicial!