import { supabase } from '@/constants/supabase';
import { nanoid } from '@/lib/utils';
import { 
  ConversationSchema,
  Conversation,
  MessageSchema,
  Message,
  openaiService, 
  Goal,
  Motivation
} from '@/lib/openai';
import { z } from 'zod';

// Chat service for managing conversations with Miles AI coach
class ChatService {
  // Create a new conversation
  public async createConversation(userId: string): Promise<Conversation> {
    try {
      const conversationId = nanoid();
      const timestamp = Date.now();
      
      // Initial system welcome message
      const welcomeMessage: Message = {
        role: 'assistant',
        content: "Hi there! I'm Miles, your personal AI coach. I'm here to help you achieve your goals and provide the support you need along the way. How can I assist you today?",
        timestamp
      };
      
      // Create conversation object
      const conversation: Conversation = {
        id: conversationId,
        userId,
        messages: [welcomeMessage],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Validate with Zod schema
      const validatedConversation = ConversationSchema.parse(conversation);
      
      // Save to Supabase
      const { error } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: userId,
          messages: validatedConversation.messages,
          created_at: new Date(timestamp).toISOString(),
          updated_at: new Date(timestamp).toISOString(),
        });
      
      if (error) throw error;
      
      return validatedConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }
  
  // Get a specific conversation
  public async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      // Convert Supabase data to our format
      const conversationData = {
        id: data.id,
        userId: data.user_id,
        messages: data.messages,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      };
      
      return ConversationSchema.parse(conversationData);
    } catch (error) {
      console.error(`Error fetching conversation ${conversationId}:`, error);
      throw new Error('Failed to fetch conversation');
    }
  }
  
  // Get the most recent conversation for a user
  public async getUserLatestConversation(userId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      // Convert Supabase data to our format
      const conversationData = {
        id: data.id,
        userId: data.user_id,
        messages: data.messages,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      };
      
      return ConversationSchema.parse(conversationData);
    } catch (error) {
      console.error(`Error fetching latest conversation for user ${userId}:`, error);
      return null;
    }
  }
  
  // Get all conversations for a user with pagination
  public async getUserConversations(
    userId: string, 
    pageSize: number = 10, 
    offset: number = 0
  ): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (error) throw error;
      
      const conversations: Conversation[] = [];
      
      data?.forEach(item => {
        try {
          const conversationData = {
            id: item.id,
            userId: item.user_id,
            messages: item.messages,
            createdAt: new Date(item.created_at).getTime(),
            updatedAt: new Date(item.updated_at).getTime(),
          };
          const validatedConversation = ConversationSchema.parse(conversationData);
          conversations.push(validatedConversation);
        } catch (error) {
          console.error(`Error validating conversation ${item.id}:`, error);
        }
      });
      
      return conversations;
    } catch (error) {
      console.error(`Error fetching conversations for user ${userId}:`, error);
      throw new Error('Failed to fetch conversations');
    }
  }
  
  // Send a message and get AI response
  public async sendMessage(
    conversationId: string, 
    content: string,
    userGoals: Goal[] = [],
    userMotivations: Motivation[] = []
  ): Promise<{ conversation: Conversation; aiResponse: string }> {
    try {
      // Validate and prepare message content
      if (!content.trim()) {
        throw new Error('Message content cannot be empty');
      }
      
      // Get the current conversation
      const conversation = await this.getConversation(conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      const timestamp = Date.now();
      
      // Create user message
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp
      };
      
      // Add user message to conversation
      const updatedMessages = [...conversation.messages, userMessage];
      
      // Update conversation in Supabase with user message
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date(timestamp).toISOString(),
        })
        .eq('id', conversationId);
      
      if (updateError) throw updateError;
      
      // Prepare messages for AI (only include the most recent messages to stay within token limits)
      const recentMessages = this.getRecentMessages(updatedMessages, 20);
      
      // Get AI response
      const aiResponseContent = await openaiService.getChatResponse(
        recentMessages,
        userGoals,
        userMotivations
      );
      
      // Create AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: Date.now()
      };
      
      // Add AI message to conversation
      const finalMessages = [...updatedMessages, aiMessage];
      
      // Update conversation in Supabase with AI response
      const { error: finalUpdateError } = await supabase
        .from('conversations')
        .update({
          messages: finalMessages,
          updated_at: new Date(aiMessage.timestamp).toISOString(),
        })
        .eq('id', conversationId);
      
      if (finalUpdateError) throw finalUpdateError;
      
      // Update the conversation object with both messages
      const updatedConversation: Conversation = {
        ...conversation,
        messages: finalMessages,
        updatedAt: aiMessage.timestamp
      };
      
      // Process conversation for insights (in background)
      this.processConversationInsights(updatedConversation).catch(error => {
        console.error('Error processing conversation insights:', error);
      });
      
      return {
        conversation: updatedConversation,
        aiResponse: aiResponseContent
      };
    } catch (error) {
      console.error(`Error sending message in conversation ${conversationId}:`, error);
      throw new Error('Failed to send message');
    }
  }
  
  // Helper method to get the most recent messages from a conversation
  private getRecentMessages(messages: Message[], count: number): Message[] {
    if (messages.length <= count) {
      return messages;
    }
    
    return messages.slice(messages.length - count);
  }
  
  // Process conversation for insights and save motivations
  private async processConversationInsights(conversation: Conversation): Promise<void> {
    try {
      // Only process conversations with at least 3 messages (excluding welcome message)
      if (conversation.messages.length < 4) {
        return;
      }
      
      // Extract insights from conversation
      const insights = await openaiService.extractInsights(conversation);
      
      // Save motivations if found
      if (insights.motivations.length > 0) {
        await this.saveUserMotivations(conversation.userId, insights.motivations);
      }
    } catch (error) {
      console.error('Error processing conversation insights:', error);
    }
  }
  
  // Save user motivations extracted from conversations
  private async saveUserMotivations(userId: string, motivations: string[]): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      
      // Process each motivation
      const motivationInserts = motivations
        .filter(text => text && text.length >= 3)
        .map(text => ({
          id: nanoid(),
          user_id: userId,
          text,
          created_at: timestamp,
        }));
      
      if (motivationInserts.length > 0) {
        const { error } = await supabase
          .from('user_motivations')
          .insert(motivationInserts);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving user motivations:', error);
    }
  }
  
  // Get user motivations
  public async getUserMotivations(userId: string): Promise<Motivation[]> {
    try {
      const { data, error } = await supabase
        .from('user_motivations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const motivations: Motivation[] = [];
      
      data?.forEach(item => {
        try {
          const motivationData = {
            id: item.id,
            userId: item.user_id,
            text: item.text,
            category: item.category,
            createdAt: new Date(item.created_at).getTime(),
          };
          const validatedMotivation = MotivationSchema.parse(motivationData);
          motivations.push(validatedMotivation);
        } catch (error) {
          console.error(`Error validating motivation ${item.id}:`, error);
        }
      });
      
      return motivations;
    } catch (error) {
      console.error(`Error fetching motivations for user ${userId}:`, error);
      throw new Error('Failed to fetch motivations');
    }
  }
  
  // Get a personalized coaching tip
  public async getCoachingTip(
    userId: string,
    goals: Goal[] = [],
    recentMood?: string
  ): Promise<string> {
    try {
      return await openaiService.getCoachingTip(userId, goals, recentMood);
    } catch (error) {
      console.error('Error getting coaching tip:', error);
      return 'Focus on small, consistent actions. Progress compounds over time!';
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;