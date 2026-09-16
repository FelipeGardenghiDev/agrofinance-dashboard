import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-agro-verde-musgo/15 text-agro-verde-musgo dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
          🌾
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-agro-verde-musgo dark:text-emerald-400">
            Erro 404
          </span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Página Não Encontrada
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            A rota ou operação solicitada não existe ou foi realocada no AgroFinance.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 rounded-xl bg-agro-azul-escuro text-white text-xs font-semibold hover:bg-agro-azul-claro transition-all cursor-pointer shadow-sm active:scale-95"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
