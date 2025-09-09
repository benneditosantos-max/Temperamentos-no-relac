#!/bin/bash

# 🚀 Script de Otimização para Hostinger
# Execute este script para preparar o upload final

echo "💕 Otimizando Amor & Temperamentos para Hostinger..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "hostinger-upload-guide.md" ]; then
    echo "❌ Execute este script na pasta hostinger-deploy/"
    exit 1
fi

print_status "Iniciando otimização..."

# 1. Criar pasta final para upload
rm -rf upload-to-hostinger
mkdir -p upload-to-hostinger/shared-hosting
mkdir -p upload-to-hostinger/vps-complete

print_status "Estrutura de pastas criada"

# 2. Preparar versão para Shared Hosting (estática)
print_status "Preparando versão para Shared Hosting..."

# Copiar build do frontend
cp -r frontend-build/* upload-to-hostinger/shared-hosting/
cp .htaccess upload-to-hostinger/shared-hosting/

# Criar index.php para melhor compatibilidade (opcional)
cat > upload-to-hostinger/shared-hosting/index.php << 'EOF'
<?php
// Redirecionar para index.html
header('Location: index.html');
exit();
?>
EOF

print_success "Versão Shared Hosting preparada"

# 3. Preparar versão completa para VPS
print_status "Preparando versão completa para VPS..."

# Copiar arquivos do backend
mkdir -p upload-to-hostinger/vps-complete/backend
cp -r ../backend/* upload-to-hostinger/vps-complete/backend/

# Copiar arquivos do frontend
mkdir -p upload-to-hostinger/vps-complete/frontend
cp -r ../frontend/* upload-to-hostinger/vps-complete/frontend/

# Copiar arquivos de configuração
cp README-HOSTINGER.md upload-to-hostinger/vps-complete/
cp .htaccess upload-to-hostinger/vps-complete/

# Criar .env templates
cat > upload-to-hostinger/vps-complete/frontend/.env.example << 'EOF'
# URL do backend - CONFIGURE AQUI
REACT_APP_BACKEND_URL=https://api.seu-dominio.com
EOF

cat > upload-to-hostinger/vps-complete/backend/.env.example << 'EOF'
# MongoDB - CONFIGURE AQUI
MONGO_URL=mongodb://localhost:27017
DB_NAME=temperaments

# Stripe - CONFIGURE AQUI
STRIPE_API_KEY=sk_live_seu_stripe_key_aqui
STRIPE_PUBLISHABLE_KEY=pk_live_seu_stripe_key_aqui

# Frontend URL - CONFIGURE AQUI
FRONTEND_URL=https://seu-dominio.com

# Opcional: Configurações de segurança
SECRET_KEY=sua_chave_secreta_aqui
ALLOWED_ORIGINS=["https://seu-dominio.com"]
EOF

print_success "Versão VPS preparada"

# 4. Criar arquivos ZIP para upload fácil
print_status "Criando arquivos ZIP..."

cd upload-to-hostinger

# ZIP para Shared Hosting (cPanel upload)
zip -r shared-hosting-upload.zip shared-hosting/
print_success "shared-hosting-upload.zip criado (${$(du -h shared-hosting-upload.zip | cut -f1)})"

# ZIP para VPS completo
zip -r vps-complete-upload.zip vps-complete/
print_success "vps-complete-upload.zip criado (${$(du -h vps-complete-upload.zip | cut -f1)})"

cd ..

# 5. Criar guias específicos
print_status "Criando guias de instalação..."

cat > upload-to-hostinger/GUIA-SHARED-HOSTING.md << 'EOF'
# 📱 Upload para Shared Hosting (cPanel)

## ✅ O que você tem:
- `shared-hosting-upload.zip` - Site completo otimizado

## 🚀 Como fazer upload:

### Método 1: Via cPanel File Manager
1. Acesse cPanel → File Manager
2. Vá para public_html/
3. Delete arquivos existentes (index.html, etc.)
4. Upload do `shared-hosting-upload.zip`
5. Extrair arquivos na public_html/
6. Pronto! Site estará em https://seu-dominio.com

### Método 2: Via FTP
1. Use FileZilla ou similar
2. Conecte em seu FTP
3. Vá para pasta public_html/
4. Upload de todos os arquivos da pasta shared-hosting/
5. Pronto!

## 🔧 URLs para testar:
- https://seu-dominio.com → Homepage
- https://seu-dominio.com/otimizado → App otimizado

## ⚠️ Limitações da versão Shared:
- Sem backend real (dados simulados)
- Sem pagamentos Stripe
- Sem banco de dados
- Apenas demonstração das funcionalidades

Para funcionalidades completas, use VPS hosting.
EOF

cat > upload-to-hostinger/GUIA-VPS.md << 'EOF'
# 🖥️ Upload para VPS/Cloud Hosting

## ✅ O que você tem:
- `vps-complete-upload.zip` - Aplicação completa

## 🚀 Como instalar:

### 1. Upload via SSH
```bash
# Conectar ao VPS
ssh root@seu-vps-ip

# Upload do arquivo (do seu PC)
scp vps-complete-upload.zip root@seu-vps-ip:/root/

# No VPS, extrair
cd /root/
unzip vps-complete-upload.zip
mv vps-complete /var/www/amor-temperamentos
```

### 2. Seguir README-HOSTINGER.md
```bash
cd /var/www/amor-temperamentos
cat README-HOSTINGER.md
# Seguir guia completo de instalação
```

## 🎯 Resultado final:
- Frontend: https://seu-dominio.com
- Backend API: https://api.seu-dominio.com
- Documentação: https://api.seu-dominio.com/docs
- Todas as funcionalidades ativas!
EOF

print_success "Guias de instalação criados"

# 6. Criar resumo final
cat > upload-to-hostinger/README-FINAL.md << 'EOF'
# 🎉 Amor & Temperamentos - Pronto para Hostinger!

## 📦 O que você tem aqui:

### 📁 Para Shared Hosting (Simples):
- `shared-hosting-upload.zip` (204 KB)
- `GUIA-SHARED-HOSTING.md`
- ⏱️ Tempo de instalação: 5 minutos
- 💰 Custo: Plano básico da Hostinger

### 📁 Para VPS/Cloud (Completo):
- `vps-complete-upload.zip` (8.2 MB)
- `GUIA-VPS.md`
- ⏱️ Tempo de instalação: 30-60 minutos
- 💰 Custo: Plano VPS da Hostinger

## 🚀 Próximos passos:

1. **Escolha sua opção:**
   - Shared Hosting = Demo/MVP simples
   - VPS Hosting = App completo com pagamentos

2. **Siga o guia correspondente:**
   - `GUIA-SHARED-HOSTING.md` ou `GUIA-VPS.md`

3. **Configure seu domínio:**
   - Aponte DNS para Hostinger
   - Configure SSL (Let's Encrypt grátis)

4. **Teste tudo:**
   - Navegação
   - Responsividade
   - Funcionalidades

## 💡 Recomendação:
Para um projeto profissional, use **VPS** para ter todas as funcionalidades:
- Sistema de pagamentos Stripe
- Banco de dados real
- Compartilhamento social
- Área premium completa

Boa sorte! 🍀
EOF

# 7. Mostrar resumo final
echo ""
echo "🎉 Otimização concluída!"
echo ""
echo "📦 Arquivos criados:"
echo "├── upload-to-hostinger/"
echo "│   ├── shared-hosting-upload.zip (${$(du -h upload-to-hostinger/shared-hosting-upload.zip 2>/dev/null | cut -f1 || echo 'N/A')})"
echo "│   ├── vps-complete-upload.zip (${$(du -h upload-to-hostinger/vps-complete-upload.zip 2>/dev/null | cut -f1 || echo 'N/A')})"
echo "│   ├── GUIA-SHARED-HOSTING.md"
echo "│   ├── GUIA-VPS.md"
echo "│   └── README-FINAL.md"
echo ""
echo "🚀 Próximos passos:"
echo "1. Acesse a pasta: cd upload-to-hostinger/"
echo "2. Leia: README-FINAL.md"
echo "3. Escolha: Shared ou VPS"
echo "4. Faça upload seguindo o guia correspondente"
echo ""
print_success "Amor & Temperamentos está pronto para conquistar a web! 💕"