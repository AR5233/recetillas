const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export default function useInspirar() {
  async function inspirar({ personas, momento, evitar, estilo, protagonista, semilla = 0 }) {
    const estiloTexto = estilo ? `TODAS estilo "${estilo}".` : 'Varía estilos.';
    const variacion = semilla ? `\n⚠️ Esta es la regeneración #${semilla}. NO repitas ingredientes ni recetas de antes. Usa ingredientes COMPLETAMENTE diferentes a los que hayas sugerido en regeneraciones anteriores.` : '';

    const prompt = `Eres Chefcito. Genera EXACTAMENTE 2 recetas DETALLADAS.${variacion}

PARÁMETROS:
- Personas: ${personas} | Momento: ${momento}
- ${estiloTexto}
- Protagonista: ${protagonista || 'ninguno'}
- Evitar: ${evitar || 'nada'}

⚠️ REGLAS DE OBLIGADO CUMPLIMIENTO:
1. EXACTAMENTE 2 recetas.
2. MÍNIMO 6 pasos, MÁXIMO 10 pasos en preparacion.
3. Si hay ingrediente estrella, DEBE ser protagonista en ambas recetas PERO con guarniciones y acompañamientos DIFERENTES.
4. NUNCA repitas la misma guarnición en las 2 recetas.
5. Cantidades con PESO (g/kg) o medidas exactas.
6. NADA de "puntosImportantes" ni "sugerencia".

Ejemplo de 6 pasos: 1.Precalentar horno 2.Preparar adobo 3.Untar y colocar en bandeja 4.Hornear 5.Gratinar 6.Reposar y servir

Devuelve SOLO JSON: {"opciones":[{"titulo":"...","descripcion":"1 frase","tiempo":"45 min","dificultad":"fácil","ingredientes":[{"nombre":"salmón","cantidad":"800 g (4 lomos)","esSugerencia":false}],"preparacion":[{"paso":1,"instruccion":"Precalentar horno a 200°C","tiempo":"5 min"},{"paso":2,"instruccion":"...","tiempo":"..."}],"tiempoTotal":"45 min"}]}`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })
    });
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content;
    return texto ? JSON.parse(texto) : { opciones: [] };
  }
  return { inspirar };
}
