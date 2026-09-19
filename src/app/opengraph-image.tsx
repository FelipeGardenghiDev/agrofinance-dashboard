import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AgroFinance — Plataforma de Crédito e Ativos Tokenizados (RWA)';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#07130c',
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.25), transparent)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
              }}
            >
              🌾
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                }}
              >
                AgroFinance <span style={{ color: '#34d399' }}>RWA</span>
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#9ca3af',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Plataforma de Finanças Descentralizadas do Agro
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            Produção Ativa na Vercel
          </div>
        </div>

        {/* Center Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '1000px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Crédito Rural, Derivativos B3 e Ativos Tokenizados (RWA)
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#9ca3af',
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            Custódia de safras de Soja e Milho com cotações em streaming, CPR Digital com colateral RWA, travas de Hedge e Modo Campo PWA.
          </div>
        </div>

        {/* Bottom Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
            }}
          >
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#e5e7eb',
              }}
            >
              Next.js 16 • React 19
            </div>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#34d399',
              }}
            >
              ✓ 115+ Testes Automatizados
            </div>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#e5e7eb',
              }}
            >
              Modo Campo Offline (PWA)
            </div>
          </div>

          <div
            style={{
              fontSize: '15px',
              color: '#6b7280',
              fontWeight: 500,
            }}
          >
            agrofinance-dashboard-dev.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
