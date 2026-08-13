/**
 * LLM Client — OpenRouter integration.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callLLM(prompt: string): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/MeghBari124/SLM_Code_Optimizer',  // Required by OpenRouter
      'X-Title': 'AlgoForge',  // Optional but recommended
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      // Alternative free models: 'liquid/lfm-2.5-2.6b:free'
      messages: [
        {
          role: 'system',
          content: 'You are a smart contract optimization assistant. You MUST respond with ONLY valid JSON matching the exact schema provided. No markdown, no explanations, no text outside the JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,  // Low temp for deterministic output
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[llm-client] OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}