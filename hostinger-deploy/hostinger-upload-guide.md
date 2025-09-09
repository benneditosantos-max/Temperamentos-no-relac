# 📁 Guia de Upload para Hostinger

## 🎯 Método 1: Hospedagem Compartilhada (Shared Hosting)

### **Passo 1: Preparar Arquivos**
✅ **Você já tem todos os arquivos prontos!**

**Arquivos necessários:**
- `frontend-build/` → Conteúdo para o site
- `.htaccess` → Configurações do servidor
- Este guia

### **Passo 2: Acessar cPanel**
1. Faça login na sua conta Hostinger
2. Acesse o **cPanel** do seu domínio
3. Abra o **File Manager**

### **Passo 3: Upload dos Arquivos**
1. **Navegar para public_html:**
   - Clique em `public_html` (pasta raiz do seu site)
   - Se for um subdomínio, entre na pasta correspondente

2. **Limpar pasta (se necessário):**
   - Delete arquivos padrão como `index.html`, `cgi-bin`, etc.
   - **CUIDADO:** Mantenha apenas arquivos que você precisa

3. **Upload do conteúdo:**
   - Selecione **todos os arquivos** da pasta `frontend-build/`
   - Clique em **Upload** ou arraste os arquivos
   - Aguarde o upload completar (pode demorar alguns minutos)

4. **Upload do .htaccess:**
   - Faça upload do arquivo `.htaccess`
   - **IMPORTANTE:** Este arquivo pode estar oculto, certifique-se que está visível

### **Passo 4: Verificar Estrutura**
Sua pasta `public_html` deve ficar assim:
```
public_html/
├── .htaccess
├── index.html
├── favicon.ico
├── manifest.json
├── static/
│   ├── css/
│   │   └── main.0ec914aa.css
│   └── js/
│       └── main.86f3cee2.js
└── asset-manifest.json
```

### **Passo 5: Testar o Site**
1. Acesse `https://seu-dominio.com`
2. Teste as seguintes URLs:
   - `/` → Homepage principal
   - `/otimizado` → Versão otimizada
   - Navegue pelo app e teste funcionalidades

---

## 🎯 Método 2: VPS/Cloud Hosting

### **Passo 1: Conectar via SSH**
```bash
ssh seu-usuario@seu-vps-ip
# Digite sua senha quando solicitado
```

### **Passo 2: Preparar Ambiente**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y nginx nodejs npm python3 python3-pip

# Instalar yarn e pm2 globalmente
sudo npm install -g yarn pm2
```

### **Passo 3: Upload do Projeto**
**Opção A: Via SCP (do seu computador):**
```bash
# Comprimir projeto
tar -czf amor-temperamentos.tar.gz backend/ frontend/ hostinger-deploy/

# Upload
scp amor-temperamentos.tar.gz seu-usuario@seu-vps-ip:/home/seu-usuario/

# No VPS, extrair
cd /home/seu-usuario/
tar -xzf amor-temperamentos.tar.gz
sudo mv amor-temperamentos /var/www/
```

**Opção B: Via Git (recomendado):**
```bash
cd /var/www/
sudo git clone https://github.com/seu-usuario/amor-temperamentos.git
sudo chown -R www-data:www-data amor-temperamentos/
```

### **Passo 4: Configurar Aplicação**
```bash
cd /var/www/amor-temperamentos/

# Frontend
cd frontend/
yarn install
yarn build

# Backend
cd ../backend/
pip3 install -r requirements.txt

# Configurar variáveis de ambiente
sudo nano frontend/.env
# REACT_APP_BACKEND_URL=https://api.seu-dominio.com

sudo nano backend/.env
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=temperaments
# STRIPE_API_KEY=sk_live_...
```

### **Passo 5: Configurar Nginx**
```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/amor-temperamentos

# Cole a configuração do nginx (ver README-HOSTINGER.md)

# Ativar site
sudo ln -s /etc/nginx/sites-available/amor-temperamentos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Passo 6: Instalar SSL**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### **Passo 7: Iniciar com PM2**
```bash
cd /var/www/amor-temperamentos/

# Iniciar backend
pm2 start backend/server.py --name "amor-backend" --interpreter python3

# Salvar configuração
pm2 save
pm2 startup
```

---

## 🔧 Resolução de Problemas

### **❌ Erro: "Página não carrega"**
**Solução:**
1. Verifique se o `.htaccess` está no local correto
2. Teste sem o `.htaccess` temporariamente
3. Verifique logs no cPanel → Error Logs

### **❌ Erro: "Arquivos CSS/JS não carregam"**
**Solução:**
1. Verifique se a pasta `static/` foi enviada corretamente
2. Teste URL direta: `seu-dominio.com/static/css/main.css`
3. Verifique permissões dos arquivos (755 para pastas, 644 para arquivos)

### **❌ Erro: "Rota /otimizado não funciona"**
**Solução:**
1. Confirme que o `.htaccess` está presente
2. Teste se mod_rewrite está ativo no servidor
3. Entre em contato com suporte da Hostinger se necessário

### **❌ Erro: "Site muito lento"**
**Solução:**
1. Verifique se gzip está ativo (via .htaccess)
2. Otimize imagens se necessário
3. Use CDN para assets estáticos

---

## 📞 Suporte Hostinger

Se encontrar problemas:
1. **Chat suporte**: 24/7 disponível
2. **Base de conhecimento**: hPanel → Help Center
3. **Logs de erro**: cPanel → Error Logs
4. **PHP/Server info**: cPanel → PHP Info

---

## ✅ Checklist Final

### **Antes de ir ao ar:**
- [ ] Todos os arquivos uploadados
- [ ] .htaccess configurado
- [ ] Site carrega em `https://seu-dominio.com`
- [ ] Rota `/otimizado` funciona
- [ ] Navegação interna funciona
- [ ] Imagens e CSS carregam
- [ ] Site responsivo (mobile/desktop)
- [ ] Performance satisfatória

### **Após ir ao ar:**
- [ ] Testar funcionalidades principais
- [ ] Configurar Google Analytics (opcional)
- [ ] Configurar certificado SSL
- [ ] Fazer backup dos arquivos
- [ ] Documentar credenciais e acessos

---

🎉 **Seu app estará online em poucos minutos!**

💡 **Dica:** Mantenha sempre um backup local dos arquivos antes de fazer uploads.