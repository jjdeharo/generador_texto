import { useState, useEffect, useMemo } from 'react';
import { generator } from './utils/markov';
import { TRANSLATIONS } from './translations';

const LANGUAGES = [
  { code: 'es', name: 'Español (Cervantes)' },
  { code: 'ca', name: 'Català (Guimerà)' },
  { code: 'ga', name: 'Galego (Rosalía)' },
  { code: 'eu', name: 'Euskara (Estatutu 1931)' },
  { code: 'en', name: 'English (Carroll)' },
  { code: 'la', name: 'Latín (Lorem Ipsum)' },
];

function App() {
  // Detectar idioma del navegador o usar 'es' por defecto
  const browserLang = navigator.language.split('-')[0];
  const defaultLang = LANGUAGES.some(l => l.code === browserLang) ? browserLang : 'es';

  const [lang, setLang] = useState(defaultLang);
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'characters'>('paragraphs');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Obtener traducciones actuales
  const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];

  // Cargar modelo cuando cambia el idioma
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setModelReady(false);
      try {
        await generator.loadModel(lang);
        setModelReady(true);
        // Generar un texto inicial automáticamente una vez cargado
        const initialText = generator.generate(count, type);
        setText(initialText);
      } catch (e) {
        console.error("Error loading model", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  const handleGenerate = () => {
    const result = generator.generate(count, type);
    setText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ajustar el límite máximo del input según el tipo
  const maxCount = type === 'characters' ? 5000 : 100;

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { paragraphs: 0, sentences: 0, words: 0, characters: 0 };
    }

    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter((s) => s.length > 0).length;
    const words = trimmed.split(/\s+/).filter((w) => w.length > 0).length;

    return {
      paragraphs,
      sentences,
      words,
      characters: text.length
    };
  }, [text]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Card Container Centrado */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 mb-2">
                {t.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={() => setShowHelp((prev) => !prev)}
              className="self-center md:self-auto px-4 py-2 text-sm font-medium rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-200 dark:hover:bg-indigo-900 transition-colors"
            >
              {t.help?.button}
            </button>
          </div>
          {showHelp && (
            <div className="bg-indigo-50 dark:bg-indigo-900/40 text-slate-700 dark:text-slate-200 rounded-xl p-4 text-sm space-y-2 border border-indigo-100 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-700 dark:text-indigo-200 text-base">{t.help?.title}</h3>
              <p>{t.help?.body}</p>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.language}
              </label>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Count & Type Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.count}
              </label>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  min="1" 
                  max={maxCount}
                  value={count} 
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center"
                />
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as any)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="paragraphs">{t.types.paragraphs}</option>
                  <option value="sentences">{t.types.sentences}</option>
                  <option value="words">{t.types.words}</option>
                  <option value="characters">{t.types.characters}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={loading || !modelReady}
            className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/30'
            }`}
          >
            {loading ? t.loading : t.generate}
          </button>
        </div>

        {/* Output Section */}
        <div className="relative border-t border-slate-200 dark:border-slate-700">
          <textarea 
            readOnly
            value={text}
            placeholder={t.placeholder}
            className="w-full h-80 p-8 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 resize-none outline-none font-serif text-lg leading-relaxed"
          />
          
          {/* Copy Button (Floating) */}
          <button 
            onClick={copyToClipboard}
            className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
              copied 
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
            } shadow-sm`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {t.copied}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                {t.copy}
              </>
            )}
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex flex-col">
              <span className="uppercase tracking-wide text-xs text-slate-500 dark:text-slate-400">{t.types.paragraphs}</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">{stats.paragraphs}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-wide text-xs text-slate-500 dark:text-slate-400">{t.types.sentences}</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">{stats.sentences}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-wide text-xs text-slate-500 dark:text-slate-400">{t.types.words}</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">{stats.words}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-wide text-xs text-slate-500 dark:text-slate-400">{t.types.characters}</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">{stats.characters}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
