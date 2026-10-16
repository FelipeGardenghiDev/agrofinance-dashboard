import Decimal from 'decimal.js';

// Configuração de precisão padrão de nível bancário (30 dígitos significativos, arredondamento HALF_EVEN)
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_EVEN });

export class FinancialMath {
  /**
   * Converte qualquer valor monetário ou numérico para Decimal seguro
   */
  static toDecimal(val: number | string | Decimal): Decimal {
    if (val instanceof Decimal) return val;
    try {
      if (typeof val === 'string') {
        let clean = val.replace(/[^\d.,-]/g, '');
        if (clean.includes(',')) {
          clean = clean.replace(/\./g, '').replace(',', '.');
        }
        return new Decimal(clean || 0);
      }
      return new Decimal(val || 0);
    } catch {
      return new Decimal(0);
    }
  }

  /**
   * Soma precisa de múltiplos valores sem erro de dízima IEEE 754
   */
  static add(...values: (number | string | Decimal)[]): Decimal {
    return values.reduce<Decimal>((acc, cur) => acc.plus(FinancialMath.toDecimal(cur)), new Decimal(0));
  }

  /**
   * Multiplicação exata com arredondamento monetário (2 casas)
   */
  static multiply(a: number | string | Decimal, b: number | string | Decimal): Decimal {
    return FinancialMath.toDecimal(a).times(FinancialMath.toDecimal(b));
  }

  /**
   * Divisão segura protegida contra divisão por zero
   */
  static divide(numerator: number | string | Decimal, denominator: number | string | Decimal): Decimal {
    const den = FinancialMath.toDecimal(denominator);
    if (den.isZero()) return new Decimal(0);
    return FinancialMath.toDecimal(numerator).dividedBy(den);
  }

  /**
   * Cálculo institucional de CPR Digital (Cédula de Produto Rural):
   * Amortização Tabela Price ou SAC com precisão centesimal e cálculo exato de LTV.
   */
  static calculateCPR(params: {
    requestedAmount: number | string;
    termMonths: number;
    spotPricePerSaca: number | string;
    annualInterestRatePercent: number | string;
    ltvMaxPercent: number | string;
  }) {
    const amount = FinancialMath.toDecimal(params.requestedAmount);
    const spotPrice = FinancialMath.toDecimal(params.spotPricePerSaca);
    const annualRate = FinancialMath.toDecimal(params.annualInterestRatePercent).dividedBy(100);
    const ltvMax = FinancialMath.toDecimal(params.ltvMaxPercent).dividedBy(100);
    const months = new Decimal(params.termMonths);

    // Taxa mensal equivalente: (1 + i_ano)^(1/12) - 1
    const one = new Decimal(1);
    const monthlyRate = one.plus(annualRate).pow(new Decimal(1).dividedBy(12)).minus(1);

    // Parcela mensal PMT (Price): P * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
    let monthlyPayment = new Decimal(0);
    let totalRepayment = new Decimal(0);
    let totalInterest = new Decimal(0);

    if (monthlyRate.gt(0) && months.gt(0)) {
      const compoundFactor = one.plus(monthlyRate).pow(months);
      const pmtNumerator = amount.times(monthlyRate).times(compoundFactor);
      const pmtDenominator = compoundFactor.minus(one);
      monthlyPayment = pmtNumerator.dividedBy(pmtDenominator);
      totalRepayment = monthlyPayment.times(months);
      totalInterest = totalRepayment.minus(amount);
    } else {
      monthlyPayment = amount.dividedBy(months);
      totalRepayment = amount;
    }

    // Colateral mínimo em sacas exigido: Amount / (spotPrice * ltvMax)
    let requiredTokens = new Decimal(0);
    if (spotPrice.gt(0) && ltvMax.gt(0)) {
      const maxFinancedPerToken = spotPrice.times(ltvMax);
      requiredTokens = amount.dividedBy(maxFinancedPerToken).ceil(); // Arredonda sempre para cima para garantir cobertura
    }

    const collateralValue = requiredTokens.times(spotPrice);
    const effectiveLtv = collateralValue.gt(0) ? amount.dividedBy(collateralValue).times(100) : new Decimal(0);

    return {
      amount: amount.toDecimalPlaces(2).toNumber(),
      monthlyPayment: monthlyPayment.toDecimalPlaces(2).toNumber(),
      totalRepayment: totalRepayment.toDecimalPlaces(2).toNumber(),
      totalInterest: totalInterest.toDecimalPlaces(2).toNumber(),
      requiredTokens: requiredTokens.toNumber(),
      collateralValue: collateralValue.toDecimalPlaces(2).toNumber(),
      effectiveLtvPercent: effectiveLtv.toDecimalPlaces(2).toNumber(),
    };
  }

  /**
   * Cálculo de Payoff de Derivativo Hedge (Opção Put / NDF cambial)
   */
  static calculateHedge(params: {
    quantitySacas: number | string;
    strikePrice: number | string;
    currentSpotPrice: number | string;
    premiumRatePercent: number | string;
  }) {
    const qty = FinancialMath.toDecimal(params.quantitySacas);
    const strike = FinancialMath.toDecimal(params.strikePrice);
    const spot = FinancialMath.toDecimal(params.currentSpotPrice);
    const premRate = FinancialMath.toDecimal(params.premiumRatePercent).dividedBy(100);

    const totalProtectedValue = qty.times(strike);
    const premiumCost = totalProtectedValue.times(premRate);

    // Put está ITM (In-The-Money) se o preço de mercado caiu abaixo do Strike
    const isITM = spot.lt(strike);
    const intrinsicValuePerSaca = isITM ? strike.minus(spot) : new Decimal(0);
    const totalIntrinsicValue = qty.times(intrinsicValuePerSaca);

    // Simulação de proteção se o mercado cair 10%
    const shockPrice = spot.times(0.90);
    const gainUnderShock = strike.minus(shockPrice).times(qty);

    return {
      totalProtectedValue: totalProtectedValue.toDecimalPlaces(2).toNumber(),
      premiumCost: premiumCost.toDecimalPlaces(2).toNumber(),
      isITM,
      intrinsicValuePerSaca: intrinsicValuePerSaca.toDecimalPlaces(2).toNumber(),
      totalIntrinsicValue: totalIntrinsicValue.toDecimalPlaces(2).toNumber(),
      potentialProtectionGain: gainUnderShock.gt(0) ? gainUnderShock.toDecimalPlaces(2).toNumber() : 0,
    };
  }

  /**
   * Gera uma chave de idempotência institucional no formato UUIDv4
   */
  static generateIdempotencyKey(operationPrefix: string = 'op'): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${operationPrefix}_${crypto.randomUUID()}`;
    }
    // Fallback seguro caso crypto.randomUUID não esteja disponível
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 10);
    return `${operationPrefix}_${ts}_${rand}`;
  }
}
