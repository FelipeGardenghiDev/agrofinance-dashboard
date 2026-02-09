import { z } from 'zod';

export const operationSchema = z.object({
  type: z.enum(['pix', 'ted', 'investment_rwa'], {
    required_error: 'Selecione o tipo de operação',
  }),
  beneficiary: z.string()
    .min(1, 'Campo obrigatório')
    .min(11, 'CPF/Chave PIX deve ter no mínimo 11 caracteres'),
  amount: z.string()
    .min(1, 'Campo obrigatório')
    .refine((val) => {
      const num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
      return !isNaN(num) && num > 0;
    }, 'Valor deve ser maior que zero')
    .refine((val) => {
      const num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
      return num <= 125480.75; // saldo disponível mockado
    }, 'Saldo insuficiente'),
  memo: z.string().optional(),
  assetId: z.string().optional(),
});

export type OperationFormValues = z.infer<typeof operationSchema>;