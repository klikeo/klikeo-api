import axios from 'axios'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface IDeepSeekService {
  chat(messages: DeepSeekMessage[]): Promise<string>
}

export class DeepSeekService implements IDeepSeekService {
  private get apiKey() { return process.env.DEEPSEEK_API_KEY ?? '' }

  async chat(messages: DeepSeekMessage[]): Promise<string> {
    const apiKey = this.apiKey
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured')
    }
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return (response.data as { choices: Array<{ message: { content: string } }> }).choices[0].message.content
  }
}
