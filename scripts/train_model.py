import requests
import json
import re
import os
import random

# Configuración de fuentes (Project Gutenberg Raw Text URLs)
SOURCES = {
    "es": "https://www.gutenberg.org/cache/epub/2000/pg2000.txt",  # Don Quijote
    "en": "https://www.gutenberg.org/cache/epub/11/pg11.txt",      # Alice in Wonderland
    "ca": "https://www.gutenberg.org/cache/epub/63283/pg63283.txt", # Tirant lo Blanc (Partial/Short) or similar. 
    # Fallback for CA if 63283 is not ideal, we try to process whatever we get.
    "ga": "https://www.gutenberg.org/cache/epub/17659/pg17659.txt", # Cantares Gallegos
    # Para Euskera (EU), usaremos un placeholder o texto manual si no hay URL estable.
    # Intentaremos una URL de ejemplo si existe, sino requerirá archivo local.
    "eu": "MANUAL" 
}

OUTPUT_DIR = "scripts/models"
CORPUS_DIR = "scripts/corpus"

def download_text(lang, url):
    filepath = os.path.join(CORPUS_DIR, f"{lang}.txt")
    
    if url == "MANUAL":
        if os.path.exists(filepath):
            print(f"[{lang}] Usando archivo manual existente.")
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            print(f"[{lang}] FALTA TEXTO. Por favor coloca un texto en {filepath}")
            return ""

    if os.path.exists(filepath):
        print(f"[{lang}] Usando caché local.")
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
            
    print(f"[{lang}] Descargando {url}...")
    try:
        response = requests.get(url)
        response.encoding = 'utf-8'
        text = response.text
        # Guardar corpus
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        return text
    except Exception as e:
        print(f"Error descargando {lang}: {e}")
        return ""

def clean_text(text):
    # Eliminar cabeceras de Gutenberg (aproximado)
    start_marker = "*** START OF THE PROJECT GUTENBERG EBOOK"
    end_marker = "*** END OF THE PROJECT GUTENBERG EBOOK"
    
    start = text.find(start_marker)
    if start != -1:
        text = text[start:]
    
    end = text.find(end_marker)
    if end != -1:
        text = text[:end]
        
    # Limpieza básica
    # Conservamos letras, números, puntuación básica y espacios.
    # Eliminamos saltos de línea excesivos.
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def build_markov_chain(text, order=1):
    """
    Construye un diccionario de cadenas de Markov.
    order=1: { "palabra_actual": ["siguiente1", "siguiente2"] }
    """
    words = text.split()
    model = {}
    
    for i in range(len(words) - order):
        key = tuple(words[i:i+order]) # Usamos tupla para soportar order > 1 si queremos mejorar
        # Para simplificar JSON, usaremos string key si order=1, o un join
        key_str = " ".join(key)
        next_word = words[i+order]
        
        if key_str not in model:
            model[key_str] = []
        
        # Limitamos el tamaño de la lista de opciones para no inflar el JSON
        if len(model[key_str]) < 20: 
            model[key_str].append(next_word)
            
    return model

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    # Mensaje especial para EU
    if not os.path.exists(os.path.join(CORPUS_DIR, "eu.txt")):
        print("\n⚠️ AVISO: No se ha configurado URL automática para Euskera (eu).")
        print("   Por favor, crea un archivo 'scripts/corpus/eu.txt' con texto en euskera y vuelve a ejecutar.\n")
        # Creamos un archivo dummy para que no falle todo, pero avisamos
        with open(os.path.join(CORPUS_DIR, "eu.txt"), 'w') as f:
            f.write("Euskara testu bat da hau. Hau da euskara testu bat. Lorem ipsum dolor sit amet.")

    for lang, url in SOURCES.items():
        raw_text = download_text(lang, url)
        if not raw_text:
            continue
            
        clean = clean_text(raw_text)
        chain = build_markov_chain(clean, order=1) # Usamos orden 1 para mantener el JSON pequeño
        
        # Guardar modelo
        output_path = os.path.join(OUTPUT_DIR, f"{lang}.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(chain, f, ensure_ascii=False)
        
        print(f"[{lang}] Modelo generado: {output_path} ({len(chain)} claves)")

if __name__ == "__main__":
    main()
