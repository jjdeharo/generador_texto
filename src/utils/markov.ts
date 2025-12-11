export type MarkovChain = Record<string, string[]>;

export class MarkovGenerator {
  private models: Record<string, MarkovChain> = {};
  private currentLang: string | null = null;

  async loadModel(lang: string): Promise<void> {
    if (this.models[lang]) {
      this.currentLang = lang;
      return;
    }

    try {
      // Usamos import.meta.env.BASE_URL para que funcione tanto en local como en GitHub Pages
      const response = await fetch(`${import.meta.env.BASE_URL}models/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load model for ${lang}`);
      const data = await response.json();
      this.models[lang] = data;
      this.currentLang = lang;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  generate(count: number, type: 'words' | 'sentences' | 'paragraphs' = 'paragraphs'): string {
    if (!this.currentLang || !this.models[this.currentLang]) return "Model not loaded.";
    
    const chain = this.models[this.currentLang];
    const keys = Object.keys(chain);
    if (keys.length === 0) return "";

    let result: string[] = [];
    
    // Función auxiliar para generar una frase
    const generateSentence = (): string => {
        let currentWord = keys[Math.floor(Math.random() * keys.length)];
        // Intentar empezar con mayúscula si es posible (heurística simple)
        const capitalKeys = keys.filter(k => /^[A-ZÁÉÍÓÚÑ]/.test(k));
        if (capitalKeys.length > 0) {
            currentWord = capitalKeys[Math.floor(Math.random() * capitalKeys.length)];
        }

        let sentence: string[] = currentWord.split(" ");
        let wordCount = sentence.length;
        
        // Generar hasta encontrar un punto o llegar a un límite
        while (wordCount < 50) { // Límite de seguridad
            const lastKey = sentence.slice(-1)[0]; 
            const possibleNext = chain[lastKey];
            
            if (!possibleNext || possibleNext.length === 0) {
                break; 
            }
            
            const next = possibleNext[Math.floor(Math.random() * possibleNext.length)];
            sentence.push(next);
            wordCount++;
            
            if (next.endsWith('.') || next.endsWith('?') || next.endsWith('!')) {
                break;
            }
        }
        return sentence.join(" ");
    };

    if (type === 'words') {
       // Generar hasta alcanzar X palabras
       let words: string[] = [];
       while (words.length < count) {
           const s = generateSentence();
           const w = s.split(" ");
           words.push(...w);
       }
       return words.slice(0, count).join(" ");
    }

    if (type === 'sentences') {
        for (let i = 0; i < count; i++) {
            result.push(generateSentence());
        }
        return result.join(" ");
    }

    if (type === 'paragraphs') {
        for (let i = 0; i < count; i++) {
            const sentencesInPara = Math.floor(Math.random() * 3) + 3; // 3 a 5 frases
            let paragraph: string[] = [];
            for (let j = 0; j < sentencesInPara; j++) {
                paragraph.push(generateSentence());
            }
            result.push(paragraph.join(" "));
        }
        return result.join("\n\n");
    }

    return "";
  }
}

export const generator = new MarkovGenerator();