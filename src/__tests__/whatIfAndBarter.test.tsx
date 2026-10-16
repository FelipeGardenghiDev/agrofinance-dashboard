import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import WhatIfMacroSimulator from '../app/components/features/WhatIfMacroSimulator';
import AgroBarterPowerCard from '../app/components/features/AgroBarterPowerCard';
import RiskAuditDossierModal from '../app/components/features/RiskAuditDossierModal';
import { useAgroFinanceStore } from '../lib/store';

describe('Funcionalidades Institucionais Agro: What-If, Barter & Dossiê Bancário', () => {
  beforeEach(() => {
    act(() => {
      useAgroFinanceStore.getState().resetToDefaultData();
    });
  });

  describe('WhatIfMacroSimulator (Stress Testing Macroeconômico)', () => {
    it('deve renderizar os sliders e recalcular o impacto patrimonial', () => {
      render(<WhatIfMacroSimulator />);

      expect(screen.getByText(/Simulador de Cenários Macroeconômicos/i)).toBeInTheDocument();
      expect(screen.getByText(/Câmbio Dólar Comercial/i)).toBeInTheDocument();
      expect(screen.getByText(/Oferta Global de Grãos/i)).toBeInTheDocument();
      expect(screen.getByText(/Taxa Selic/i)).toBeInTheDocument();

      // Clica no preset de Quebra de Safra
      const secaButton = screen.getByRole('button', { name: /Quebra Safra EUA/i });
      fireEvent.click(secaButton);

      // Deve exibir variação patrimonial projetada
      expect(screen.getByText(/Impacto Projetado/i)).toBeInTheDocument();
    });
  });

  describe('AgroBarterPowerCard (Relação de Troca & Insumos)', () => {
    it('deve renderizar a paridade de sacas para Adubo NPK e Diesel', () => {
      render(<AgroBarterPowerCard />);

      expect(screen.getByText(/Poder de Compra Agro & Barter/i)).toBeInTheDocument();
      expect(screen.getByText(/Adubo NPK \(04-14-08\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Diesel S10 Granel/i)).toBeInTheDocument();
      expect(screen.getByText(/Fungicida Sistêmico Premium/i)).toBeInTheDocument();
    });
  });

  describe('RiskAuditDossierModal (Comprovante Auditável para Bancos)', () => {
    it('não deve renderizar quando isOpen for false', () => {
      const { container } = render(<RiskAuditDossierModal isOpen={false} onClose={() => {}} />);
      expect(container.firstChild).toBeNull();
    });

    it('deve renderizar dados institucionais, hash SHA-256 e botões quando isOpen for true', () => {
      render(<RiskAuditDossierModal isOpen={true} onClose={() => {}} />);

      expect(screen.getByText(/Dossiê Institucional de Risco & Garantias AgroFinance/i)).toBeInTheDocument();
      expect(screen.getByText(/RELATÓRIO QUANTITATIVO DE RISCO/i)).toBeInTheDocument();
      expect(screen.getByText(/Monte Carlo \(1.000 iterações\)/i)).toBeInTheDocument();
      expect(screen.getByText(/HASH SHA-256 DO RELATÓRIO/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Salvar em PDF \/ Imprimir/i })).toBeInTheDocument();
    });
  });
});
