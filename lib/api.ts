import type { GenerateCreativeResponse } from './types';

export interface GenerateCreativeParams {
  task: string;
  style: string;
  prompt?: string;
  image?: string;
  persona_id?: string;
  payload?: {
    prompt?: string;
    image_base64?: string;
  };
}

export async function generateCreative(
  params: GenerateCreativeParams
): Promise<GenerateCreativeResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return getMockResponse(params);
  }

  try {
    const response = await fetch(`${apiUrl}/v1/engine/creative/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: params.task,
        style: params.style,
        persona_id: params.persona_id || 'default_creator',
        payload: {
          prompt: params.prompt || params.payload?.prompt,
          image_base64: params.image || params.payload?.image_base64,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn('API failed, using mock:', err);
    return getMockResponse(params);
  }
}

function getMockResponse(params: GenerateCreativeParams): GenerateCreativeResponse {
  return {
    status: 'success',
    creative_id: `mock_${Date.now()}`,
    task: params.task,
    style_used: params.style,
    model_used: 'mock-model',
    credits_charged: 0,
    mock_mode: true,
    outputs: {
      images: [],
      copy: `Mock output untuk task "${params.task}" dengan style "${params.style}". Backend belum connected.`,
      metadata: { generated_at: new Date().toISOString() },
    },
  };
}

export default generateCreative;
