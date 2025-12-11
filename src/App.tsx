import { useState, useEffect } from 'react';
import { generator } from './utils/markov';

const LANGUAGES = [
  { code: 'es', name: 'Español (Cervantes)' },
  { code: 'ca', name: 'Català (Tirant lo Blanc)' },
  { code: 'ga', name: 'Galego (Rosalía)' },
  { code: 'eu', name: 'Euskara (Beta)' },
  { code: 'en', name: 'English (Carroll)' },
];

function App() {
  const [lang, setLang] = useState('es');
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'characters'>('paragraphs');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setModelReady(false);
      try {
        await generator.loadModel(lang);
        setModelReady(true);
        // Generar inicial
        handleGenerate();
      } catch (e) {
        console.error("Error loading model", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  const handleGenerate = () => {
    // Pequeño timeout para permitir que el estado de loading se renderice si fuera necesario, 
    // aunque aquí es síncrono una vez cargado el modelo.
    const result = generator.generate(count, type);
    setText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight sm:text-5xl mb-2">
            Ipsum Gen
          </h1>
          <p className="text-lg text-gray-400">
            Generador de texto de relleno realista basado en literatura clásica.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Language Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Idioma</label>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Count & Type */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Cantidad</label>
            <div className="flex space-x-2">
              <input 
                type="number" 
                min="1" 
                max={type === 'characters' ? 5000 : 100} 
                value={count} 
                onChange={(e) => setCount(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-20 p-2.5"
              />
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                <option value="paragraphs">Párrafos</option>
                <option value="sentences">Frases</option>
                <option value="words">Palabras</option>
                <option value="characters">Caracteres</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button 
              onClick={handleGenerate}
              disabled={loading || !modelReady}
              className={`w-full text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Cargando modelo...' : 'Generar Texto'}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="relative">
          <textarea 
            readOnly
            value={text}
            className="w-full h-96 p-4 bg-gray-100 text-gray-900 rounded-xl shadow-inner border border-gray-300 focus:ring-2 focus:ring-indigo-500 resize-none font-serif text-lg leading-relaxed"
          />
          <button 
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded hover:bg-gray-700 opacity-80 hover:opacity-100 transition"
          >
            Copiar
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Hecho con ❤️ usando Cadenas de Markov y React.</p>
        </div>

      </div>
    </div>
  );
}

export default App;