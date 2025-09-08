#!/bin/bash

# 🚀 Script de Deploy - Amor & Temperamentos
# Execute este script para preparar o app para produção

echo "💕 Preparando Amor & Temperamentos para Deploy..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "EXPORT_README.md" ]; then
    print_error "Script deve ser executado na pasta raiz do projeto!"
    exit 1
fi

print_status "Verificando dependências..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado! Instale Node.js 18+ primeiro."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 não encontrado! Instale Python 3.8+ primeiro."
    exit 1
fi

# Check Yarn
if ! command -v yarn &> /dev/null; then
    print_warning "Yarn não encontrado. Instalando..."
    npm install -g yarn
fi

print_success "Dependências verificadas!"

# Install Frontend Dependencies
print_status "Instalando dependências do Frontend..."
cd frontend
yarn install
if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências do frontend!"
    exit 1
fi
print_success "Frontend dependencies instaladas!"

# Install Backend Dependencies  
print_status "Instalando dependências do Backend..."
cd ../backend
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências do backend!"
    exit 1
fi
print_success "Backend dependencies instaladas!"

# Build Frontend for Production
print_status "Fazendo build de produção do Frontend..."
cd ../frontend
yarn build
if [ $? -ne 0 ]; then
    print_error "Falha no build do frontend!"
    exit 1
fi
print_success "Build do frontend concluído!"

# Create .env templates if they don't exist
cd ..
if [ ! -f "frontend/.env" ]; then
    print_status "Criando template .env para frontend..."
    cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
    print_warning "Configure REACT_APP_BACKEND_URL no frontend/.env"
fi

if [ ! -f "backend/.env" ]; then
    print_status "Criando template .env para backend..."
    cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=temperaments
STRIPE_API_KEY=sk_test_...
FRONTEND_URL=http://localhost:3000
EOF
    print_warning "Configure as variáveis de ambiente no backend/.env"
fi

# Create production start script
print_status "Criando script de start para produção..."
cat > start_production.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando Amor & Temperamentos em modo produção..."

# Start Backend
echo "Iniciando backend na porta 8001..."
cd backend && python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start Frontend (serve static build)
echo "Servindo frontend na porta 3000..."
cd frontend && npx serve -s build -l 3000 &
FRONTEND_PID=$!

echo "✅ Aplicação rodando!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8001"
echo "📖 API Docs: http://localhost:8001/docs"

# Wait for Ctrl+C
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start_production.sh

# Create development start script
print_status "Criando script de start para desenvolvimento..."
cat > start_development.sh << 'EOF'
#!/bin/bash

echo "💻 Iniciando Amor & Temperamentos em modo desenvolvimento..."

# Start Backend in development
echo "Iniciando backend com hot reload..."
cd backend && python3 server.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start Frontend in development
echo "Iniciando frontend com hot reload..."
cd frontend && yarn start &
FRONTEND_PID=$!

echo "✅ Desenvolvimento iniciado!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8001"
echo "🌟 App Otimizado: http://localhost:3000/otimizado"

# Wait for Ctrl+C
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start_development.sh

print_success "Scripts de inicialização criados!"

# Final summary
echo ""
echo "🎉 Deploy preparado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente:"
echo "   - frontend/.env (REACT_APP_BACKEND_URL)"
echo "   - backend/.env (MONGO_URL, STRIPE_API_KEY)"
echo ""
echo "2. Para desenvolvimento:"
echo "   ./start_development.sh"
echo ""
echo "3. Para produção:"
echo "   ./start_production.sh"
echo ""
echo "4. URLs importantes:"
echo "   - App Principal: http://localhost:3000"
echo "   - App Otimizado: http://localhost:3000/otimizado"
echo "   - API Docs: http://localhost:8001/docs"
echo ""
print_success "Amor & Temperamentos está pronto para conquistar corações! 💕"
EOF