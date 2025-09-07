import React, { useState } from 'react';
import { Button } from './ui/button';
import ShareWithPartnerModal from './ShareWithPartner';

const ShareTest = () => {
  const [showModal, setShowModal] = useState(false);

  const mockData = {
    userTemperament: 'Colérico',
    partnerTemperament: 'Sanguíneo',
    compatibility: { score: 85 },
    userName: 'Ana Silva',
    partnerName: 'João Santos'
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Teste do Sistema de Compartilhamento</h1>
      
      <div className="space-y-4">
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4"
        >
          🔗 Abrir Modal de Compartilhamento
        </Button>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Dados de Teste:</h3>
          <ul className="text-sm space-y-1">
            <li>• Usuário: {mockData.userName} - {mockData.userTemperament}</li>
            <li>• Parceiro: {mockData.partnerName} - {mockData.partnerTemperament}</li>
            <li>• Compatibilidade: {mockData.compatibility.score}%</li>
          </ul>
        </div>
      </div>

      <ShareWithPartnerModal
        open={showModal}
        onOpenChange={setShowModal}
        userTemperament={mockData.userTemperament}
        partnerTemperament={mockData.partnerTemperament}
        compatibility={mockData.compatibility}
        isPremium={false}
        userName={mockData.userName}
        partnerName={mockData.partnerName}
      />
    </div>
  );
};

export default ShareTest;