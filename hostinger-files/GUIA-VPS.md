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
