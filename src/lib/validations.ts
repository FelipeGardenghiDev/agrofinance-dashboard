import { z } from 'zod';
import type { RWAAsset } from './types';

export const createOperationSchema = (
  maxBalance?: number,
  userAssets?: RWAAsset[]
) =>
  z
    .object({
      type: z.enum(['pix', 'ted', 'investment_rwa', 'sell_rwa', 'redeem_rwa'], {
        message: 'Selecione o tipo de operação',
      }),
      beneficiary: z.string().optional(),
      amount: z.string().min(1, 'Informe o valor da operação'),
      memo: z.string().optional(),
      assetId: z.string().optional(),
      tokens: z.number().optional(),
      warehouse: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const numAmount = parseFloat(data.amount.replace(/\./g, '').replace(',', '.'));

      if (isNaN(numAmount) || numAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount'],
          message: 'Valor deve ser maior que zero',
        });
        return;
      }

      // Validações para PIX e TED
      if (data.type === 'pix' || data.type === 'ted') {
        const minLen = data.type === 'pix' ? 11 : 5;
        if (!data.beneficiary || data.beneficiary.trim().length < minLen) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['beneficiary'],
            message:
              data.type === 'pix'
                ? 'CPF/Chave PIX deve ter no mínimo 11 caracteres'
                : 'Informe os dados bancários de destino',
          });
        }
        if (typeof maxBalance === 'number' && numAmount > maxBalance) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: 'Saldo insuficiente',
          });
        }
      }

      // Validações para Aporte RWA (Compra)
      if (data.type === 'investment_rwa') {
        if (!data.assetId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['assetId'],
            message: 'Selecione um ativo RWA para aporte',
          });
        }
        if (typeof maxBalance === 'number' && numAmount > maxBalance) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: 'Saldo insuficiente',
          });
        }
      }

      // Validações para Venda RWA
      if (data.type === 'sell_rwa') {
        if (!data.assetId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['assetId'],
            message: 'Selecione o ativo RWA que deseja vender',
          });
        } else if (userAssets && userAssets.length > 0) {
          const asset = userAssets.find((a) => a.assetId === data.assetId);
          if (!asset) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['assetId'],
              message: 'Ativo não encontrado em seu portfólio',
            });
          } else {
            const maxAssetValue = asset.totalValue;
            if (numAmount > maxAssetValue + 0.01) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['amount'],
                message: `Saldo de tokens insuficiente (máximo: R$ ${maxAssetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
              });
            }
          }
        }
      }

      // Validações para Resgate Físico de Commodities
      if (data.type === 'redeem_rwa') {
        if (!data.assetId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['assetId'],
            message: 'Selecione o ativo RWA para resgate físico',
          });
        } else if (userAssets && userAssets.length > 0) {
          const asset = userAssets.find((a) => a.assetId === data.assetId);
          if (!asset) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['assetId'],
              message: 'Ativo não encontrado em seu portfólio',
            });
          } else {
            const maxAssetValue = asset.totalValue;
            if (numAmount > maxAssetValue + 0.01) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['amount'],
                message: `Saldo de tokens insuficiente para resgate físico (máximo: ${asset.quantity} tokens)`,
              });
            }
          }
        }

        if (!data.warehouse || data.warehouse.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['warehouse'],
            message: 'Selecione o armazém credenciado para retirada física',
          });
        }
      }
    });

export const operationSchema = createOperationSchema(125480.75);

export type OperationFormValues = z.infer<typeof operationSchema>;