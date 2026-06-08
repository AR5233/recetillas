import { CHEFCITO_ESTRUCTURAR } from '../constants/prompts';

const CEREBRAS_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
const CEREBRAS_ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

let lastCerebrasCall = 0;
const CEREBRAS_INTERVAL = 15000;

function parseIngredientes(texto) {
  if (!texto) return [];
  const lineas = texto.trim().split('\n');
  const ingredientes = [];
  for (const linea of lineas) {
    const trimmed = linea.trim();
    if (!trimmed || !trimmed.startsWith('-')) continue;
    const contenido = trimmed.substring(1).trim();
    const dosPuntos = contenido.indexOf(':');
    if (dosPuntos === -1) continue;
    const nombre = contenido.substring(0, dosPuntos).trim();
    const cantidad = contenido.substring(dosPuntos + 1).trim();
    ingredientes.push({ nombre, cantidad, esSugerencia: false });
  }
  return ingredientes;
}

function parsePreparacion(texto) {
  if (!texto) return [];
  const lineas = texto.trim().split('\n');
  const preparacion = [];
  for (const linea of lineas) {
    const trimmed = linea.trim();
    if (!trimmed) continue;
    const puntoIdx = trimmed.indexOf('.');
    if (puntoIdx === -1) continue;
    const paso = parseInt(trimmed.substring(0, puntoIdx), 10);
    if (isNaN(paso)) continue;
    const resto = trimmed.substring(puntoIdx + 1).trim();
    const dosPuntos = resto.indexOf(':');
    const instruccion = dosPuntos !== -1 ? resto.substring(0, dosPuntos).trim() : resto;
    const tiempo = dosPuntos !== -1 ? resto.substring(dosPuntos + 1).trim() : '';
    preparacion.push({ paso, instruccion, tiempo });
  }
  return preparacion;
}

function parseReceta(texto) {
  if (!texto || typeof texto !== 'string') {
    return { titulo: 'Error', categoria: 'otro', ingredientes: [], preparacion: [], tiempoTotal: '', puntosImportantes: [], elementosFaltantes: [], sugerencia: 'Error' };
  }
  const secciones = {};
  const etiquetas = ['CATEGORÍA:', 'TÍTULO:', 'INGREDIENTES:', 'PREPARACIÓN:', 'TIEMPO TOTAL:', 'PUNTOS IMPORTANTES:', 'ELEMENTOS FALTANTES:', 'SUGERENCIA:'];
  let currentKey = null, currentValue = '';
  for (const linea of texto.split('\n')) {
    const trimmed = linea.trim();
    if (!trimmed) continue;
    let matched = null;
    for (const etq of etiquetas) { if (trimmed.startsWith(etq)) { matched = etq; break; } }
    if (matched) {
      if (currentKey) secciones[currentKey] = currentValue.trim();
      currentKey = matched;
      currentValue = trimmed.substring(matched.length).trim() + '\n';
    } else if (currentKey) {
      currentValue += trimmed + '\n';
    }
  }
  if (currentKey) secciones[currentKey] = currentValue.trim();
  return {
    titulo: secciones['TÍTULO:'] || '',
    categoria: secciones['CATEGORÍA:'] || 'otro',
    ingredientes: secciones['INGREDIENTES:'] ? parseIngredientes(secciones['INGREDIENTES:']) : [],
    preparacion: secciones['PREPARACIÓN:'] ? parsePreparacion(secciones['PREPARACIÓN:']) : [],
    tiempoTotal: secciones['TIEMPO TOTAL:'] || '',
    puntosImportantes: (secciones['PUNTOS IMPORTANTES:'] || '').split('\n').filter(l => l.trim()).map(l => l.replace(/^- /, '')),
    elementosFaltantes: [],
    sugerencia: secciones['SUGERENCIA:'] || ''
  };
}

async function esperarCerebras() {
  const ahora = Date.now();
  const espera = CEREBRAS_INTERVAL - (ahora - lastCerebrasCall);
  if (espera > 0) await new Promise(r => setTimeout(r, espera));
  lastCerebrasCall = Date.now();
}

export default function useCerebras() {
  async function estructurar(textoUsuario, numPersonas) {
    await esperarCerebras();
    const response = await fetch(CEREBRAS_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${CEREBRAS_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: [
          { role: 'system', content: CHEFCITO_ESTRUCTURAR },
          { role: 'user', content: `Texto: ${textoUsuario}\nPersonas: ${numPersonas}` }
        ],
        max_tokens: 3500
      })
    });
    if (!response.ok) throw new Error(`Chefcito no responde. Código: ${response.status}`);
    const data = await response.json();
    const contenido = data.choices?.[0]?.message?.content;
    if (!contenido) throw new Error('Chefcito no devolvió contenido.');
    return parseReceta(contenido);
  }

  async function reescalar(ingredientes, dePersonas, aPersonas) {
    if (!ingredientes?.length || dePersonas === aPersonas) return ingredientes;
    const lista = ingredientes.map(i => `- ${i.nombre}: ${i.cantidad}`).join('\n');
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Eres un chef experto. Reescala esta receta de forma REALISTA. No uses multiplicación lineal. El arroz, pasta y legumbres esponjan (×0.4-0.6). Los condimentos fuertes (ajo, guindilla) no se multiplican apenas. Los líquidos se ajustan con criterio. Devuelve solo la lista de ingredientes con cantidades ajustadas. Formato: - ingrediente: cantidad' },
          { role: 'user', content: `Receta para ${dePersonas} personas:\n${lista}\n\nReescala para ${aPersonas} personas.` }
        ],
        max_tokens: 500
      })
    });
    if (!response.ok) throw new Error(`Error al reescalar. Código: ${response.status}`);
    const data = await response.json();
    const contenido = data.choices?.[0]?.message?.content;
    return contenido ? parseIngredientes(contenido) : ingredientes;
  }

  async function limpiarTexto(texto) {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres un asistente que limpia transcripciones de recetas en español latino. Corrige errores de transcripción, elimina muletillas (ehh, mmm, este...), organiza en INGREDIENTES y PREPARACIÓN. NO añadas título. NO inventes ingredientes. NO corrijas cantidades. Solo limpia y organiza lo que ya está. Devuelve solo el texto limpio.' },
          { role: 'user', content: texto }
        ],
        max_tokens: 1000
      })
    });
    if (!response.ok) throw new Error(`Error al limpiar texto. Código: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || texto;
  }

  return { estructurar, reescalar, limpiarTexto };
}
