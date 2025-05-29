import { 
  collection,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/constants/firebase';
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
  private readonly conversationsCollection = 'conversations';
  private readonly userMotivationsCollection = 'user_motivations';
  
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
      
      // Save to Firestore
      const conversationRef = doc(db, this.conversationsCollection, conversationId);
      await setDoc(conversationRef, validatedConversation);
      
      return validatedConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }
  
  // Get a specific conversation
  public async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(db, this.conversationsCollection, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        return null;
      }
      
      const conversationData = conversationDoc.data() as Record<string, any>;
      return ConversationSchema.parse(conversationData);
    } catch (error) {
      console.error(`Error fetching conversation ${conversationId}:`, error);
      throw new Error('Failed to fetch conversation');
    }
  }
  
  // Get the most recent conversation for a user
  public async getUserLatestConversation(userId: string): Promise<Conversation | null> {
    try {
      const conversationsQuery = query(
        collection(db, this.conversationsCollection),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(conversationsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const conversationData = querySnapshot.docs[0].data() as Record<string, any>;
      return ConversationSchema.parse(conversationData);
    } catch (error) {
      console.error(`Error fetching latest conversation for user ${userId}:`, error);
      throw new Error('Failed to fetch latest conversation');
    }
  }
  
  // Get all conversations for a user with pagination
  public async getUserConversations(
    userId: string, 
    pageSize: number = 10, 
    lastConversation?: Conversation
  ): Promise<Conversation[]> {
    try {
      let conversationsQuery;
      
      if (lastConversation) {
        conversationsQuery = query(
          collection(db, this.conversationsCollection),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
          startAfter(lastConversation.updatedAt),
          limit(pageSize)
        );
      } else {
        conversationsQuery = query(
          collection(db, this.conversationsCollection),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(conversationsQuery);
      const conversations: Conversation[] = [];
      
      querySnapshot.forEach(doc => {
        try {
          const conversationData = doc.data() as Record<string, any>;
          const validatedConversation = ConversationSchema.parse(conversationData);
          conversations.push(validatedConversation);
        } catch (error) {
          console.error(`Error validating conversation ${doc.id}:`, error);
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
      
      // Update conversation in Firestore with user message
      const conversationRef = doc(db, this.conversationsCollection, conversationId);
      await updateDoc(conversationRef, {
        messages: updatedMessages,
        updatedAt: timestamp
      });
      
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
      
      // Update conversation in Firestore with AI response
      await updateDoc(conversationRef, {
        messages: finalMessages,
        updatedAt: aiMessage.timestamp
      });
      
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
      const timestamp = Date.now();
      
      // Process each motivation
      for (const text of motivations) {
        // Skip empty or very short motivations
        if (!text || text.length < 3) {
          continue;
        }
        
        const motivationId = nanoid();
        
        // Create motivation object
        const motivation: Motivation = {
          id: motivationId,
          userId,
          text,
          createdAt: timestamp
        };
        
        // Save to Firestore
        const motivationRef = doc(db, this.userMotivationsCollection, motivationId);
        await setDoc(motivationRef, motivation);
      }
    } catch (error) {
      console.error('Error saving user motivations:', error);
    }
  }
  
  // Get user motivations
  public async getUserMotivations(userId: string): Promise<Motivation[]> {
    try {
      const motivationsQuery = query(
        collection(db, this.userMotivationsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(motivationsQuery);
      const motivations: Motivation[] = [];
      
      querySnapshot.forEach(doc => {
        try {
          const motivationData = doc.data() as Record<string, any>;
          const validatedMotivation = MotivationSchema.parse(motivationData);
          motivations.push(validatedMotivation);
        } catch (error) {
          console.error(`Error validating motivation ${doc.id}:`, error);
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
