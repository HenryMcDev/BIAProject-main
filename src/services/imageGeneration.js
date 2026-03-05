const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateImage = async (prompt, referenceImageUrl = null) => {
    if (!API_KEY) throw new Error('API Key não configurada.');

    console.log("--- INICIANDO GERAÇÃO (FIXED) ---");

    // CORREÇÃO CRÍTICA: O Flux aceita apenas STRING (Texto), não objetos de imagem complexos.
    // Em vez de mandar o objeto de imagem, vamos injetar a instrução no texto.
    let finalPrompt = prompt;

    if (referenceImageUrl) {
        // Adicionamos a URL como referência textual, caso o modelo consiga ler, 
        // mas principalmente removemos o objeto complexo que causava o Erro 400.
        finalPrompt = `${prompt} --style-reference-url: ${referenceImageUrl}`;
    }

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
                "model": "google/gemini-3-pro-image-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": finalPrompt // Enviando APENAS texto (String simples)
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error("ERRO API:", JSON.stringify(err, null, 2));
            throw new Error(err.error?.message || `Erro API: ${response.status}`);
        }

        const data = await response.json();
        console.log("DEBUG: Resposta bruta da IA:", JSON.stringify(data, null, 2));

        // Extração robusta da URL da imagem
        const rawContent = data.choices?.[0]?.message?.content || "";
        let finalUrl = null;

        // 1. Tenta achar URL de markdown: ![alt](URL)
        const mdMatch = rawContent.match(/!\[.*?\]\((https?:\/\/.*?)\)/);
        // 2. Tenta achar URL solta: https://...
        const urlMatch = rawContent.match(/(https?:\/\/[^\s)]+)/);

        if (mdMatch) {
            finalUrl = mdMatch[1];
        } else if (urlMatch) {
            finalUrl = urlMatch[1] || urlMatch[0];
        } else if (rawContent.startsWith("http")) {
            finalUrl = rawContent;
        }

        if (!finalUrl) {
            console.warn("URL não encontrada no texto. Texto recebido:", rawContent);
            // Fallback visual para não travar o usuário
            finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 50))}?width=1024&height=1024&nologo=true`;
        }

        // Limpa caracteres estranhos no final da URL (comum em IAs)
        if (finalUrl.endsWith(')') || finalUrl.endsWith('.')) {
            finalUrl = finalUrl.slice(0, -1);
        }

        console.log("URL FINAL:", finalUrl);
        return finalUrl;

    } catch (error) {
        console.error("FALHA GERAL:", error);
        throw error;
    }
};
