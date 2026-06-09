import { CHEFCITO_ESTRUCTURAR } from '../constants/prompts';

const CEREBRAS_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
const CEREBRAS_ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const LIMPIADOR_PROMPT = `Eres un asistente que PULE transcripciones de recetas en español latino. Tu tarea:
1. Elimina muletillas (ehh, mmm, este...), pausas, repeticiones.
2. Corrige errores OBVIOS de transcripción.
3. Organiza en dos bloques: INGREDIENTES y PREPARACIÓN.
4. Si detectas palabras que suenan como errores de transcripción pero son ingredientes reales (ej: "vagina moto" → "ajinomoto", "sillou" → "sillao"), corrígelas automáticamente. Usa el contexto de cocina.
5. Al final, añade una sección "📝 SUGERENCIAS DEL LIMPIADOR" con observaciones como:
   - "El ingrediente X no tiene cantidad, ¿puedes indicarla?"
   - "No se menciona cómo cocinar Y"
   - "Se asume que Z se refiere a W por el contexto"
Máximo 2 sugerencias. Cada una de 1 frase corta. Si no hay problemas reales, no escribas la sección SUGERENCIAS. El usuario editará antes de enviar a Chefcito.\n\nCorrecciones automáticas que debes hacer si detectas estos errores de transcripción:\n- "vagina moto" → "ajinomoto"\n- "sillou" → "sillao" (salsa de soja)\n- "curve" → "cúrcuma"\n- "comino" mal transcrito → "comino"`;

function parseReceta(texto) {
  if (!texto || typeof texto !== 'string') {
    return { titulo: 'Error', categoria: 'otro', ingredientes: [], preparacion: [], tiempoTotal: '', puntosImportantes: [], elementosFaltantes: [], sugerencia: 'Error' };
  }
  try {
    const json = JSON.parse(texto);
    return {
      titulo: json.titulo || '',
      categoria: json.categoria || 'otro',
      ingredientes: json.ingredientes || [],
      preparacion: json.preparacion || [],
      tiempoTotal: json.tiempoTotal || '',
      puntosImportantes: json.puntosImportantes || [],
      elementosFaltantes: json.elementosFaltantes || [],
      sugerencia: json.sugerencia || ''
    };
  } catch (e) {
    console.error('JSON inválido, intentando parseo por etiquetas');
    return { titulo: '', categoria: 'otro', ingredientes: [], preparacion: [], tiempoTotal: '', puntosImportantes: [], elementosFaltantes: [], sugerencia: '' };
  }
}

async function llamarIA(endpoint, key, model, messages, maxTokens) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens })
  });
  if (!response.ok) throw new Error(`${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

export default function useCerebras() {
  async function estructurar(textoUsuario, numPersonas) {
    const messages = [
      { role: 'system', content: CHEFCITO_ESTRUCTURAR },
      { role: 'user', content: `Texto: ${textoUsuario}\nPersonas: ${numPersonas}` }
    ];
    try {
      const contenido = await llamarIA(CEREBRAS_ENDPOINT, CEREBRAS_KEY, 'gpt-oss-120b', messages, 3500);
      if (!contenido) throw new Error('Sin contenido');
      return parseReceta(contenido);
    } catch (e) {
      console.log('Cerebras falló, usando Groq como respaldo...');
      const contenido = await llamarIA(GROQ_ENDPOINT, GROQ_KEY, 'llama-3.3-70b-versatile', messages, 3500);
      if (!contenido) throw new Error('Groq tampoco respondió');
      return parseReceta(contenido);
    }
  }

  async function reescalar(ingredientes, dePersonas, aPersonas) {
    if (!ingredientes?.length || dePersonas === aPersonas) return ingredientes;
    const lista = ingredientes.map(i => `- ${i.nombre}: ${i.cantidad}`).join('\n');
    const contenido = await llamarIA(GROQ_ENDPOINT, GROQ_KEY, 'llama-3.3-70b-versatile', [
      { role: 'system', content: 'Eres un chef experto. Reescala esta receta de forma REALISTA. El arroz, pasta y legumbres esponjan (x0.5). Los condimentos fuertes no se multiplican apenas. Devuelve solo la lista con cantidades ajustadas. Formato: - ingrediente: cantidad' },
      { role: 'user', content: `Receta para ${dePersonas} personas:\n${lista}\n\nReescala para ${aPersonas} personas.` }
    ], 500);
    return contenido ? contenido.split('\n').filter(l => l.startsWith('-')).map(l => { const p = l.substring(1).split(':'); return { nombre: (p[0]||'').trim(), cantidad: (p[1]||'').trim(), esSugerencia: false }; }) : ingredientes;
  }

  async function limpiarTexto(texto) {
    const contenido = await llamarIA(GROQ_ENDPOINT, GROQ_KEY, 'llama-3.1-8b-instant', [
      { role: 'system', content: LIMPIADOR_PROMPT },
      { role: 'user', content: texto }
    ], 1000);
    return contenido || texto;
  }

  return { estructurar, reescalar, limpiarTexto };
}
