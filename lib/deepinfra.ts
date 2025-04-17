/**
 * DeepInfra API client for text generation
 */

// Types for API requests and responses
export interface DeepInfraCompletionRequest {
  model: string
  prompt?: string
  messages?: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
  stop?: string[]
}

export interface DeepInfraCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message?: {
      role: string
      content: string
    }
    text?: string
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface DeepInfraStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta?: {
      role?: string
      content?: string
    }
    text?: string
    finish_reason: string | null
  }>
}

// Updated model IDs based on current DeepInfra API
export const DEEPINFRA_MODELS = {
  MISTRAL_7B: "mistralai/Mistral-7B-Instruct-v0.2",
  MIXTRAL_8X7B: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  LLAMA_3_8B: "meta-llama/Meta-Llama-3-8B-Instruct",
  LLAMA_3_70B: "meta-llama/Meta-Llama-3-70B-Instruct",
  GEMMA_7B: "google/gemma-7b-it",
  STABLE_LM: "stabilityai/stablelm-zephyr-3b",
}

// Default model to use as fallback
export const DEFAULT_MODEL = DEEPINFRA_MODELS.MISTRAL_7B

/**
 * Generate a completion from DeepInfra API
 */
export async function generateCompletion(options: DeepInfraCompletionRequest): Promise<DeepInfraCompletionResponse> {
  if (!process.env.DEEPINFRA_API_KEY) {
    throw new Error("DEEPINFRA_API_KEY is not set")
  }

  try {
    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: options.messages || [],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024,
        stream: options.stream || false,
        stop: options.stop,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("DeepInfra API error response:", errorData)

      // If the model doesn't exist, try with the default model
      if (errorData.error?.message?.includes("does not exist") && options.model !== DEFAULT_MODEL) {
        console.warn(`Model ${options.model} not found, falling back to ${DEFAULT_MODEL}`)
        return generateCompletion({
          ...options,
          model: DEFAULT_MODEL,
        })
      }

      throw new Error(`DeepInfra API error: ${errorData.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error calling DeepInfra API:", error)
    throw error
  }
}

/**
 * Generate a streaming completion from DeepInfra API
 */
export async function generateCompletionStream(
  options: DeepInfraCompletionRequest,
  onChunk: (chunk: DeepInfraStreamChunk) => void,
): Promise<void> {
  if (!process.env.DEEPINFRA_API_KEY) {
    throw new Error("DEEPINFRA_API_KEY is not set")
  }

  const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages || [],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024,
      stream: true,
      stop: options.stop,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`DeepInfra API error: ${errorData.error?.message || response.statusText}`)
  }

  if (!response.body) {
    throw new Error("Response body is null")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk
      .split("\n")
      .filter((line) => line.trim() !== "")
      .filter((line) => line.trim() !== "data: [DONE]")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const jsonStr = line.slice(6) // Remove 'data: ' prefix
          const data = JSON.parse(jsonStr) as DeepInfraStreamChunk
          onChunk(data)
        } catch (e) {
          console.error("Error parsing stream chunk:", e)
        }
      }
    }
  }
}

/**
 * Simple test function to verify API connectivity
 */
export async function testDeepInfraConnection(): Promise<boolean> {
  try {
    await generateCompletion({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working?" },
      ],
      max_tokens: 10,
    })
    return true
  } catch (error) {
    console.error("DeepInfra connection test failed:", error)
    return false
  }
}
