import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../app/components/ui/Button';
import Badge from '../app/components/ui/Badge';
import Spinner from '../app/components/ui/Spinner';
import Card from '../app/components/ui/Card';
import Input from '../app/components/ui/Input';

describe('Design System UI Components', () => {
  describe('Button', () => {
    it('deve renderizar diferentes variantes e tamanhos', () => {
      const { rerender } = render(<Button variant="primary">Principal</Button>);
      expect(screen.getByRole('button', { name: 'Principal' })).toHaveClass('bg-agro-azul-claro');

      rerender(<Button variant="danger" size="lg">Perigo</Button>);
      expect(screen.getByRole('button', { name: 'Perigo' })).toHaveClass('bg-red-600');

      rerender(<Button variant="secondary" size="sm">Secundário</Button>);
      expect(screen.getByRole('button', { name: 'Secundário' })).toHaveClass('px-3');
    });

    it('deve disparar evento de clique quando não desabilitado', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clique Aqui</Button>);
      fireEvent.click(screen.getByRole('button', { name: 'Clique Aqui' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Badge', () => {
    it('deve renderizar variantes com suas classes de status', () => {
      const { rerender } = render(<Badge variant="success">Aprovado</Badge>);
      expect(screen.getByText('Aprovado')).toHaveClass('bg-green-100');

      rerender(<Badge variant="warning">Pendente</Badge>);
      expect(screen.getByText('Pendente')).toHaveClass('bg-yellow-100');

      rerender(<Badge variant="error">Falhou</Badge>);
      expect(screen.getByText('Falhou')).toHaveClass('bg-red-100');

      rerender(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info')).toHaveClass('bg-blue-100');
    });
  });

  describe('Spinner', () => {
    it('deve renderizar o spinner com classes de animação e tamanhos', () => {
      const { container, rerender } = render(<Spinner size="sm" />);
      expect(container.firstChild).toHaveClass('animate-spin', 'w-4');

      rerender(<Spinner size="lg" />);
      expect(container.firstChild).toHaveClass('w-12');
    });
  });

  describe('Card & Input', () => {
    it('deve renderizar Card com filhos e classes customizadas', () => {
      render(<Card className="custom-class"><p>Conteúdo</p></Card>);
      expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    });

    it('deve renderizar Input com label, erro e evento de alteração', () => {
      const handleChange = vi.fn();
      render(
        <Input
          label="Nome do Produtor"
          placeholder="Digite o nome"
          error="Campo obrigatório"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Nome do Produtor')).toBeInTheDocument();
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Digite o nome'), {
        target: { value: 'Fazenda Santa Maria' },
      });
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
