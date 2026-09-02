import { z } from 'zod';

export const createOperationSchema = (maxBalance?: number) => z.object({
  type: z.enum(['pix', 'ted', 'investment_rwa'], {
    message: 'Selecione o tipo de operação',
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
      if (typeof maxBalance !== 'number') return true;
      const num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
      return num <= maxBalance;
    }, 'Saldo insuficiente'),
  memo: z.string().optional(),
  assetId: z.string().optional(),
});

export const operationSchema = createOperationSchema(125480.75);

export type OperationFormValues = z.infer<typeof operationSchema>;