import OpenAI from 'openai';
import { z } from 'zod';

// Define types for message
export const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  timestamp: z.number().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Define types for conversation
export const ConversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  messages: z.array(MessageSchema),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// Define user goal structure
export const GoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  milestones: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean().default(false),
    progress: z.number().min(0).max(100).default(0),
  })),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Goal = z.infer<typeof GoalSchema>;

// Define user motivation structure
export const MotivationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  text: z.string(),
  category: z.string().optional(),
  createdAt: z.number(),
});

export type Motivation = z.infer<typeof MotivationSchema>;

// OpenAI service class
class OpenAIService {
  private client: OpenAI | null = null;
  private systemPrompt = `
You are Miles, an enterprise AI coach.
Your primary function is to help users achieve their goals through supportive, personalized coaching.

Core Personality Traits:
- Supportive & Encouraging: Always offer positive reinforcement, celebrate user efforts and successes (big or small), and provide encouragement during challenges.
- Empathetic: Acknowledge user feelings and respond in ways that validate emotions without being overly sentimental.
- Optimistic & Positive: Maintain a hopeful outlook regarding the user's goals and potential, helping to reframe setbacks as learning opportunities.
- Friendly & Approachable: Interact in a warm, slightly informal manner, like a trusted friend. Avoid overly robotic or formal language.
- Patient & Non-Judgmental: Never express frustration or judgment, regardless of user progress or setbacks.
- Curious & Attentive: Show genuine interest in the user's goals, progress, and well-being through relevant questions.
- Respectful of Boundaries: While friendly, avoid being overly intrusive or demanding personal information not relevant to the coaching context.

Communication Guidelines:
- Use clear, simple, and accessible language with positive framing.
- Use contractions to enhance informality (e.g., "you're," "let's," "we can").
- Avoid jargon, complex psychological terms, and overly technical language.
- Incorporate light, supportive humor very sparingly, and avoid sarcasm.
- Keep responses concise (<100 tokens when possible).

Important Boundaries:
- You are NOT a therapist or mental health professional.
- You are NOT a financial, medical, or legal advisor.
- You are NOT a source for factual information outside the coaching domain.
- Never make promises you can't keep.

Always reference the user's stored goals and motivations. Never invent new goals or information about the user.
`;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  // Initialize with API key
  public initialize(apiKey: string): void {
    this.client = new OpenAI({ apiKey });
  }

  // Get coaching response
  public async getChatResponse(
    messages: Message[],
    userGoals: Goal[] = [],
    userMotivations: Motivation[] = []
  ): Promise<string> {
    try {
      // If no client, use a fallback response
      if (!this.client) {
        return "I'm here to help you achieve your goals! However, I'm currently experiencing some technical difficulties. Please try again in a moment.";
      }

      // Prepare context with user goals and motivations
      let contextContent = this.systemPrompt;
      
      if (userGoals.length > 0) {
        contextContent += '\n\nUser Goals:';
        userGoals.forEach(goal => {
          contextContent += `\n- ${goal.title} (Progress: ${goal.progress}%)`;
          if (goal.milestones.length > 0) {
            contextContent += '\n  Milestones:';
            goal.milestones.forEach(milestone => {
              contextContent += `\n  - ${milestone.title} (${milestone.completed ? 'Completed' : `Progress: ${milestone.progress}%`})`;
            });
          }
        });
      }
      
      if (userMotivations.length > 0) {
        contextContent += '\n\nUser Motivations:';
        userMotivations.forEach(motivation => {
          contextContent += `\n- ${motivation.text}`;
        });
      }

      // Create full message array with system prompt
      const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: contextContent },
        ...messages.map(msg => ({ role: msg.role, content: msg.content }))
      ];

      // Call OpenAI API
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || "I apologize, but I'm unable to provide a response at the moment.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  }

  // Extract key insights from conversation
  public async extractInsights(conversation: Conversation): Promise<{
    motivations: string[];
    keyMoments: string[];
  }> {
    try {
      if (!this.client) {
        return { motivations: [], keyMoments: [] };
      }

      const promptContent = `
Analyze the following conversation between a user and Miles (AI coach). 
Extract:
1. User's motivations (what drives them)
2. Key moments (significant achievements, challenges, or insights)

Keep each extracted item concise (<10 words).
Return exactly 2 JSON arrays: "motivations" and "keyMoments".

Conversation:
${conversation.messages.map(m => `${m.role}: ${m.content}`).join('\n')}
`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.3,
        max_tokens: 250,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{"motivations":[], "keyMoments":[]}';
      const parsed = JSON.parse(content);
      
      return {
        motivations: Array.isArray(parsed.motivations) ? parsed.motivations : [],
        keyMoments: Array.isArray(parsed.keyMoments) ? parsed.keyMoments : []
      };
    } catch (error) {
      console.error('Extract insights error:', error);
      return { motivations: [], keyMoments: [] };
    }
  }

  // Generate milestone suggestions based on goal
  public async suggestMilestones(goalTitle: string, goalDescription?: string): Promise<string[]> {
    try {
      if (!this.client) {
        return [
          'Start with a small daily habit',
          'Track progress weekly',
          'Increase difficulty gradually',
          'Celebrate first major achievement',
        ];
      }

      const promptContent = `
Generate 3-5 specific, measurable milestones for the following goal:
Goal: ${goalTitle}
${goalDescription ? `Description: ${goalDescription}` : ''}

Create milestones that are:
1. Progressive (building toward the main goal)
2. Specific and measurable
3. Achievable in 1-2 weeks each

Return ONLY a JSON array of milestone titles. Each milestone should be 3-8 words.
`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.7,
        max_tokens: 250,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{"milestones":[]}';
      const parsed = JSON.parse(content);
      
      return Array.isArray(parsed.milestones) ? parsed.milestones : [];
    } catch (error) {
      console.error('Suggest milestones error:', error);
      return [];
    }
  }

  // Generate personalized coaching tip
  public async getCoachingTip(
    userId: string,
    goals: Goal[] = [],
    recentMood?: string
  ): Promise<string> {
    try {
      if (!this.client) {
        return "Remember that progress isn't always linear. Celebrate your effort today!";
      }

      let promptContent = `
Generate a short, personalized coaching tip for a user.
${goals.length > 0 ? `The user has the following goals:
${goals.map(g => `- ${g.title} (Progress: ${g.progress}%)`).join('\n')}` : ''}
${recentMood ? `The user's recent mood: ${recentMood}` : ''}

The tip should be:
1. Motivational but practical
2. Brief (30-50 words)
3. Specific to their goals if provided
4. Aligned with Miles' supportive coaching persona

Return ONLY the tip text, nothing else.
`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.7,
        max_tokens: 100,
      });

      return response.choices[0]?.message?.content || 'Keep pushing forward. Every small step counts!';
    } catch (error) {
      console.error('Get coaching tip error:', error);
      return "Remember that progress isn't always linear. Celebrate your effort today!";
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
export default openaiService;