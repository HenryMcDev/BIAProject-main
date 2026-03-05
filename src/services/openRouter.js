const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// PERSONALIDADE PADRÃO: O ESTRATEGISTA (Usado no Chat da Home)
export const MARKETING_AGENT_PROMPT = `
Você é o 'BIT AI', o estrategista de marketing digital sênior da 'BIT Educação & Negócios'.
MISSÃO: Ajudar a criar conteúdo de alta conversão para Instagram, focado em educação e tecnologia.
DIRETRIZES:
1. Tom: Instrucional e direto.
2. Identidade: Azul (#005696) e Amarelo (#FFCC00).
3. Idioma: Sempre responda em Português do Brasil.
`;

// NOVA PERSONALIDADE: O ARTISTA TÉCNICO (Usado no Criar Arte)
export const IMAGE_GEN_PROMPT = `
You are an expert AI Art Prompt Engineer for Flux and Midjourney models.
YOUR TASK:
1. Receive a simple idea from the user (in Portuguese).
2. Translate and Expand it into a highly detailed image generation prompt in ENGLISH.
3. Focus on lighting, texture, camera angle (e.g., "cinematic lighting", "unreal engine 5 render", "hyperrealistic").
4. IMPORTANT: Output ONLY the raw English prompt string. Do not add conversational text like "Here is your prompt".
`;

export const GEMINI_PROMPT_SYSTEM = `
ATUAR COMO: Diretor de Arte Sênior da 'BIT System' e Especialista em Imagen 3.
FUNÇÃO: Criar prompts de geração de imagem altamente detalhados e técnicos.

IDENTIDADE VISUAL OBRIGATÓRIA (ESTILO BIT):
Todas as imagens devem seguir estritamente este padrão estético:
1. **Fundo:** Azul Marinho Profundo (Deep Navy Blue #001f3f) com gradientes sutis.
2. **Ambiente:** Tecnológico, limpo, com linhas de circuito cibernético (cybernetic lines) finas e brilhantes no fundo.
3. **Iluminação:** Cinemática, Volumétrica, com luz de recorte (Rim Light) em Amarelo Vibrante (#FFCC00) para destacar o sujeito.
4. **Estilo:** Renderização 3D Hiper-realista (Estilo Pixar Corporate ou Unreal Engine 5), texturas suaves, acabamento premium "glassmorphism".
5. **Vibe:** Futuro, Educação, Tecnologia, Inovação.

REGRAS DE SAÍDA:
- RETORNE APENAS O TEXTO DO PROMPT EM INGLÊS.
- NÃO use aspas, introduções ou explicações.

ESTRUTURA DO PROMPT FINAL:
"Create a premium 3D render for an educational technology brand. [INSERIR AQUI A IDEIA DO USUÁRIO, convertendo para uma cena 3D]. The scene is set against a deep navy blue background with subtle glowing cybernetic circuit patterns. Use vibrant yellow lighting accents to highlight the main subject. High quality, 8k resolution, cinematic lighting, 3D cartoon-realism style."
`;

export const HASHTAG_PROMPT = "Você é um especialista em Instagram da BIT. Gere 10 a 15 hashtags de alta relevância, em português, baseadas no texto fornecido. Retorne APENAS as hashtags separadas por espaço. Nada de introdução.";

/**
 * Envia mensagem para a IA.
 * @param {Array} messages - Histórico da conversa
 * @param {String} [customSystemPrompt] - (Opcional) Sobrescreve a personalidade padrão
 */
export const sendMessageToOpenRouter = async (messages, customSystemPrompt = null) => {
    if (!API_KEY) {
        throw new Error('API Key is missing. Check .env file.');
    }

    // Decide qual personalidade usar: A customizada ou a padrão (Marketing)
    const activeSystemPrompt = customSystemPrompt || MARKETING_AGENT_PROMPT;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "BIT System",
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o",
                "messages": [
                    { "role": "system", "content": activeSystemPrompt },
                    ...messages
                ],
                "temperature": 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erro na API OpenRouter');
        }

        const data = await response.json();
        return data.choices[0].message;

    } catch (error) {
        console.error("OpenRouter Error:", error);
        throw error;
    }
};
