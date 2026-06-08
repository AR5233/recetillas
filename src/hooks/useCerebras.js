import { CHEFCITO_ESTRUCTURAR } from '../constants/prompts';

const API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
const ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';

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
  const categoria = secciones['CATEGORÍA:'] || 'otro';
  const titulo = secciones['TÍTULO:'] || '';
  const tiempoTotal = secciones['TIEMPO TOTAL:'] || '';
  const sugerencia = secciones['SUGERENCIA:'] || '';
  const ingredientesArray = secciones['INGREDIENTES:'] ? parseIngredientes(secciones['INGREDIENTES:']) : [];
  const preparacionArray = secciones['PREPARACIÓN:'] ? parsePreparacion(secciones['PREPARACIÓN:']) : [];
  const puntosImportantes = [];
  if (secciones['PUNTOS IMPORTANTES:']) {
    for (const linea of secciones['PUNTOS IMPORTANTES:'].split('\n')) {
      const t = linea.trim();
      if (t.startsWith('-')) puntosImportantes.push(t.substring(1).trim());
      else if (t && t !== 'Ninguno') puntosImportantes.push(t);
    }
  }
  const elementosFaltantesArray = [];
  if (secciones['ELEMENTOS FALTANTES:']) {
    for (const linea of secciones['ELEMENTOS FALTANTES:'].split('\n')) {
      const t = linea.trim();
      if (!t || t === 'Ninguno' || !t.startsWith('-')) continue;
      const contenido = t.substring(1).trim();
      const guionIdx = contenido.lastIndexOf(' — ');
      if (guionIdx !== -1) {
        const nc = contenido.substring(0, guionIdx).trim();
        const razon = contenido.substring(guionIdx + 3).trim();
        const dp = nc.indexOf(':');
        if (dp !== -1) {
          elementosFaltantesArray.push({ nombre: nc.substring(0, dp).trim(), cantidad: nc.substring(dp + 1).trim(), razon, esSugerencia: true });
        }
      }
    }
  }
  return { titulo, categoria, ingredientes: ingredientesArray, preparacion: preparacionArray, tiempoTotal, puntosImportantes, elementosFaltantes: elementosFaltantesArray, sugerencia };
}

function extraerNumero(cantidad) {
  const limpio = cantidad.replace(/\u202F/g, ' ').replace(/\u00A0/g, ' ').replace(/≈/g, '').trim();
  if (limpio === 'al gusto' || limpio === 'suficiente para freír' || limpio.startsWith('suficiente')) return null;
  const match = limpio.match(/^([\d,.]+)/);
  if (match) return parseFloat(match[1].replace(',', '.'));
  const fracciones = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1/3, '⅔': 2/3 };
  for (const [simbolo, valor] of Object.entries(fracciones)) {
    if (limpio.startsWith(simbolo)) return valor;
  }
  return null;
}

function extraerUnidad(cantidad) {
  const limpio = cantidad.replace(/\u202F/g, ' ').replace(/\u00A0/g, ' ').replace(/≈/g, '').trim();
  const match = limpio.match(/^[\d,.\/½¼¾⅓⅔]+\s*(.*)/);
  if (!match) return limpio;
  const resto = match[1].trim();
  if (!resto) return '';
  const parenIdx = resto.indexOf('(');
  if (parenIdx !== -1) return resto.substring(0, parenIdx).trim();
  return resto;
}

function reescalarLocal(ingredientes, dePersonas, aPersonas) {
  const factor = aPersonas / dePersonas;
  return ingredientes.map(ing => {
    let cantidadLimpia = ing.cantidad.replace(/ para \d+ personas?/gi, "").trim();
    const numero = extraerNumero(cantidadLimpia);
    if (numero === null) return { ...ing };
    const unidad = extraerUnidad(cantidadLimpia);
    const nuevoNumero = numero * factor;
    let nuevoStr;
    if (nuevoNumero < 0.5 && Math.abs(nuevoNumero - 0.25) < 0.01) nuevoStr = '¼';
    else if (nuevoNumero < 0.5 && Math.abs(nuevoNumero - 1/3) < 0.01) nuevoStr = '⅓';
    else if (Math.abs(nuevoNumero - 0.5) < 0.01) nuevoStr = '½';
    else if (Math.abs(nuevoNumero - 0.75) < 0.01) nuevoStr = '¾';
    else if (Number.isInteger(nuevoNumero)) nuevoStr = nuevoNumero.toString();
    else nuevoStr = nuevoNumero.toFixed(1).replace('.', ',');
    return { ...ing, cantidad: unidad ? `${nuevoStr} ${unidad}` : nuevoStr };
  });
}

export default function useCerebras() {
  async function estructurar(textoUsuario, numPersonas) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: [{ role: 'system', content: CHEFCITO_ESTRUCTURAR }, { role: 'user', content: `Texto: ${textoUsuario}\nPersonas: ${numPersonas}` }],
        max_tokens: 2500
      })
    });
    if (!response.ok) throw new Error(`API: ${response.status}`);
    const data = await response.json();
    const contenido = data.choices?.[0]?.message?.content;
    if (!contenido) throw new Error('Sin contenido');
    return parseReceta(contenido);
  }

  function reescalar(ingredientes, dePersonas, aPersonas) {
    if (!ingredientes?.length) return [];
    if (dePersonas === aPersonas) return ingredientes;
    return reescalarLocal(ingredientes, dePersonas, aPersonas);
  }

  return { estructurar, reescalar };
}
