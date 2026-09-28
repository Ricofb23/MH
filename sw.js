// Configura tu clave de API de Google AI Studio
const GEMINI_API_KEY = "TU_API_KEY_AQUI"; 

async function procesarAudioConIA() {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  const resumenOutput = document.getElementById('resumenOutput');
  
  document.getElementById('resultSection').classList.remove('hidden');
  resumenOutput.innerText = `⏳ Enviando audio temporal a Gemini 2.5 Flash...\nAplicando plantilla de: ${usuarioActivo.especialidad}`;

  try {
    // 1. Convertir el Blob de audio a Base64
    const base64Audio = await blobToBase64(audioBlob);
    const audioDataOnly = base64Audio.split(',')[1]; // Remover el encabezado data:audio/webm;base64,

    // 2. Armar la instrucción (Prompt) sumando la especialidad y los parámetros requeridos
    const promptTexto = `Eres un asistente médico experto. Escucha la siguiente consulta médica de 10 minutos y genera un resumen clínico estructurado.
Especialidad del médico: ${usuarioActivo.especialidad}
Instrucciones específicas de extracción: ${usuarioActivo.prompt}

Responde en formato Markdown claro con títulos y viñetas. Omite charlas informales o saludos.`;

    // 3. Petición POST a la API de Gemini 2.5 Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptTexto },
            {
              inline_data: {
                mime_type: "audio/webm",
                data: audioDataOnly
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const resumenTexto = data.candidates[0].content.parts[0].text;
      resumenOutput.innerText = resumenTexto;
    } else {
      resumenOutput.innerText = "❌ No se pudo procesar el resumen. Revisa la consola o tu API Key.";
      console.error(data);
    }

  } catch (error) {
    resumenOutput.innerText = "❌ Error de conexión con la API de Gemini: " + error.message;
    console.error(error);
  }
}

// Función auxiliar para convertir Blob a Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}