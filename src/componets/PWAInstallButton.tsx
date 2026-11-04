import React, { useState } from 'react';
import { Download, Smartphone, X, Check, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ReadingSettings, THEMES } from '../types/reader';

interface PWAInstallButtonProps {
  settings: ReadingSettings;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ settings }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const currentTheme = THEMES[settings.theme];

  // If already installed and launched from home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 border"
        style={{
          backgroundColor: '#10B981',
          color: '#ffffff',
          borderColor: '#059669',
        }}
        title="Instalar como aplicativo no Android / Celular"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Instalar App</span>
        <span className="xs:hidden">Instalar</span>
      </button>

      {/* Android / Mobile Installation Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border space-y-4"
            style={{
              backgroundColor: currentTheme.uiBg,
              color: currentTheme.text,
              borderColor: currentTheme.uiBorder,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Instalar no seu Aparelho</h3>
                  <p className="text-xs opacity-70">Aplicativo nativo sem barra do navegador</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isInstallable ? (
              <div className="space-y-3">
                <p className="text-xs opacity-90 leading-relaxed">
                  O navegador está pronto para instalar o <strong>Reflow PDF</strong> diretamente no seu celular ou tablet.
                </p>
                <button
                  onClick={async () => {
                    await install();
                    setShowGuide(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Confirmar Instalação Agora
                </button>
              </div>
            ) : isIOS ? (
              <div className="space-y-3 text-xs leading-relaxed opacity-90">
                <p className="font-semibold text-amber-500">Instruções para iPhone / iPad (Safari):</p>
                <ol className="list-decimal pl-4 space-y-1.5 opacity-80">
                  <li>Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima) na barra inferior do Safari.</li>
                  <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                  <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed opacity-90">
                <p className="font-semibold text-emerald-500">Instruções para Android (Google Chrome):</p>
                <ol className="list-decimal pl-4 space-y-1.5 opacity-80">
                  <li>Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
                  <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li>Pronto! O ícone do app aparecerá na gaveta de aplicativos e na tela inicial do seu celular.</li>
                </ol>
              </div>
            )}

            <div className="pt-2 border-t text-[11px] opacity-60 flex items-center gap-1.5" style={{ borderColor: currentTheme.uiBorder }}>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span>Funciona 100% offline e com tela cheia sem barras de URL.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
