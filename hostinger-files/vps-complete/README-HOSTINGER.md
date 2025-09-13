# 🚀 Deploy do Amor & Temperamentos na Hostinger

## 📋 Pré-requisitos

### **1. Conta Hostinger**
- Plano recomendado: **VPS** ou **Cloud Hosting** (para Node.js e Python)
- Alternativamente: **Shared Hosting Premium** (apenas frontend estático)

### **2. Domínio Configurado**
- Exemplo: `temperamentos.com` ou `amor-temperamentos.com`
- DNS apontando para os nameservers da Hostinger

## 🎯 Opções de Deploy

### **Opção A: VPS/Cloud (Recomendado - App Completo)**
✅ Frontend React + Backend FastAPI + MongoDB
✅ Todas as funcionalidades ativas
✅ Sistema de pagamentos Stripe
✅ Compartilhamento social completo

### **Opção B: Shared Hosting (Frontend Estático)**
⚠️ Apenas frontend React (build estático)
⚠️ Backend simulado com dados mock
⚠️ Funcionalidades limitadas (sem pagamentos reais)

## 🔧 Guia de Deploy - OPÇÃO A (VPS/Cloud)

### **Passo 1: Preparar o VPS**
```bash
# 1. Conectar via SSH ao seu VPS Hostinger
ssh root@seu-vps-ip

# 2. Atualizar sistema
apt update && apt upgrade -y

# 3. Instalar dependências
apt install -y nginx nodejs npm python3 python3-pip mongodb
npm install -g yarn pm2

# 4. Configurar firewall
ufw allow 22,80,443,3000,8001/tcp
ufw enable
```

### **Passo 2: Upload dos Arquivos**
```bash
# No seu computador local, comprimir o projeto
cd /caminho/para/projeto
tar -czf amor-temperamentos.tar.gz .

# Upload via SCP
scp amor-temperamentos.tar.gz root@seu-vps-ip:/var/www/

# No VPS, extrair
cd /var/www/
tar -xzf amor-temperamentos.tar.gz
mv /var/www/app /var/www/amor-temperamentos
```

### **Passo 3: Instalar Dependências**
```bash
cd /var/www/amor-temperamentos

# Frontend
cd frontend
yarn install
yarn build

# Backend
cd ../backend
pip3 install -r requirements.txt
```

### **Passo 4: Configurar Variáveis de Ambiente**
```bash
# Frontend (.env)
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=https://api.seu-dominio.com
EOF

# Backend (.env)
cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=temperaments
STRIPE_API_KEY=sk_live_seu_stripe_key
FRONTEND_URL=https://seu-dominio.com
EOF
```

### **Passo 5: Configurar Nginx**
```bash
# Criar configuração do Nginx
cat > /etc/nginx/sites-available/amor-temperamentos << 'EOF'
# Frontend
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        root /var/www/amor-temperamentos/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Redirect para HTTPS
    return 301 https://$server_name$request_uri;
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS Frontend
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    ssl_certificate /etc/ssl/certs/seu-dominio.crt;
    ssl_certificate_key /etc/ssl/private/seu-dominio.key;
    
    location / {
        root /var/www/amor-temperamentos/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Headers de segurança
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}

# HTTPS Backend
server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;
    
    ssl_certificate /etc/ssl/certs/seu-dominio.crt;
    ssl_certificate_key /etc/ssl/private/seu-dominio.key;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/amor-temperamentos /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### **Passo 6: Configurar SSL (Let's Encrypt)**
```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificados SSL
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Auto-renovação
crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Passo 7: Iniciar Aplicação com PM2**
```bash
cd /var/www/amor-temperamentos

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'amor-temperamentos-backend',
      script: 'backend/server.py',
      interpreter: 'python3',
      cwd: '/var/www/amor-temperamentos',
      env: {
        PORT: 8001,
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_file: '/var/log/pm2/backend.log'
    }
  ]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔧 Guia de Deploy - OPÇÃO B (Shared Hosting)

### **Passo 1: Build Estático**
```bash
# No seu computador local
cd frontend
yarn build

# Comprimir build
cd build
zip -r amor-temperamentos-static.zip .
```

### **Passo 2: Upload via cPanel**
1. Acesse o cPanel da Hostinger
2. File Manager → public_html
3. Upload do arquivo `amor-temperamentos-static.zip`
4. Extrair arquivos na pasta public_html

### **Passo 3: Configurar .htaccess**
```apache
# Criar arquivo .htaccess na public_html
RewriteEngine On

# Handle React Router
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

## 🗄️ Configuração de Banco de Dados

### **Para VPS (MongoDB)**
```bash
# Configurar MongoDB
systemctl enable mongod
systemctl start mongod

# Criar usuário admin
mongo
> use admin
> db.createUser({user: "admin", pwd: "senha_forte", roles: ["root"]})
> exit

# Habilitar autenticação
echo "security:\n  authorization: enabled" >> /etc/mongod.conf
systemctl restart mongod
```

### **Para Shared Hosting (MySQL)**
```javascript
// Modificar backend para usar MySQL ao invés de MongoDB
// Arquivo: backend/database.py

import mysql.connector
from mysql.connector import Error

class MySQLDatabase:
    def __init__(self):
        self.connection = mysql.connector.connect(
            host='localhost',
            database='seu_usuario_temperaments',
            user='seu_usuario',
            password='sua_senha'
        )
    
    async def create_user(self, user_data):
        cursor = self.connection.cursor()
        query = """INSERT INTO users (id, name, email, birth_date, zodiac_sign) 
                   VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(query, (
            user_data['id'], 
            user_data['name'], 
            user_data['email'], 
            user_data['birth_date'], 
            user_data['zodiac_sign']
        ))
        self.connection.commit()
```

## 📊 Monitoramento e Logs

### **VPS Monitoring**
```bash
# Status dos serviços
pm2 status
systemctl status nginx
systemctl status mongod

# Logs em tempo real
pm2 logs amor-temperamentos-backend --lines 50
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Uso de recursos
htop
df -h
free -h
```

## 🔄 Backup e Manutenção

### **Script de Backup Automático**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/amor-temperamentos"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db temperaments --out $BACKUP_DIR/mongo_$DATE/

# Backup arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/amor-temperamentos/

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "mongo_*" -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "files_*" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

## 🚀 Checklist Final

### **Antes do Go-Live**
- [ ] Domínio configurado e propagado
- [ ] SSL certificado instalado
- [ ] Stripe configurado com chaves de produção
- [ ] Banco de dados configurado e populado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes de funcionalidade completos
- [ ] Backup automático configurado
- [ ] Monitoramento ativo

### **URLs para Testar**
- [ ] `https://seu-dominio.com` → Homepage
- [ ] `https://seu-dominio.com/otimizado` → App otimizado
- [ ] `https://api.seu-dominio.com/docs` → API docs
- [ ] `https://api.seu-dominio.com/health` → Health check

---

💝 **Seu app estará no ar em aproximadamente 30-60 minutos seguindo este guia!**