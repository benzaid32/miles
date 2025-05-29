import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar, Day, Message } from 'react-native-gifted-chat';
import { useAuth } from '@/hooks/useAuth';
import chatService from '@/lib/chatService';
import goalService from '@/lib/goalService';
import { Conversation, Message as MilesMessage, Goal, Motivation } from '@/lib/openai';
import { Send as SendIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Define props for ChatUI component
interface ChatUIProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
  showGoalSelector?: boolean;
}

export const ChatUI: React.FC<ChatUIProps> = ({ 
  conversationId: initialConversationId,
  onConversationCreated,
  showGoalSelector = false
}) => {
  // State
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [userMotivations, setUserMotivations] = useState<Motivation[]>([]);
  
  // Refs
  const isInitializedRef = useRef(false);
  
  // Hooks
  const { user } = useAuth();
  
  // Initialize chat and load messages
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || isInitializedRef.current) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let conversation: Conversation | null = null;
        
        // If conversationId is provided, load that conversation
        if (conversationId) {
          conversation = await chatService.getConversation(conversationId);
          
          // If conversation not found or doesn't belong to user, reset
          if (!conversation || conversation.userId !== user.uid) {
            setConversationId(undefined);
            conversation = null;
          }
        }
        
        // If no conversation, get latest or create new
        if (!conversation) {
          conversation = await chatService.getUserLatestConversation(user.uid);
          
          // If no existing conversation, create new one
          if (!conversation) {
            conversation = await chatService.createConversation(user.uid);
            
            // Notify parent component if needed
            if (onConversationCreated) {
              onConversationCreated(conversation.id);
            }
          }
          
          setConversationId(conversation.id);
        }
        
        // Load user goals and motivations
        const goals = await goalService.getUserGoals(user.uid);
        const motivations = await chatService.getUserMotivations(user.uid);
        
        setUserGoals(goals);
        setUserMotivations(motivations);
        
        // Format messages for GiftedChat
        const formattedMessages = formatMessagesForGiftedChat(conversation.messages, user.uid);
        setMessages(formattedMessages);
        
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to load conversation. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [user, conversationId, onConversationCreated]);
  
  // Format Miles messages for GiftedChat
  const formatMessagesForGiftedChat = (
    milesMessages: MilesMessage[], 
    userId: string
  ): IMessage[] => {
    return milesMessages.map((msg, index) => ({
      _id: msg.timestamp || index,
      text: msg.content,
      createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      user: {
        _id: msg.role === 'user' ? userId : 'miles-ai',
        name: msg.role === 'user' ? 'You' : 'Miles',
        avatar: msg.role === 'user' ? undefined : require('@/assets/images/miles-avatar.png'),
      },
    })).reverse(); // GiftedChat requires reverse chronological order
  };
  
  // Handle sending a message
  const handleSend = useCallback(async (messages: IMessage[]) => {
    if (!user || !conversationId || messages.length === 0) return;
    
    const messageToSend = messages[0];
    
    // Convert to Miles message format
    const content = messageToSend.text.trim();
    
    if (!content) return;
    
    try {
      setSending(true);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Add to UI immediately for responsiveness
      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, messages)
      );
      
      // Send to service
      const response = await chatService.sendMessage(
        conversationId,
        content,
        userGoals,
        userMotivations
      );
      
      // Format AI response for GiftedChat
      const aiMessage: IMessage = {
        _id: response.conversation.updatedAt,
        text: response.aiResponse,
        createdAt: new Date(response.conversation.updatedAt),
        user: {
          _id: 'miles-ai',
          name: 'Miles',
          avatar: require('@/assets/images/miles-avatar.png'),
        },
      };
      
      // Add AI response to UI
      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, [aiMessage])
      );
      
      // Haptic feedback for received message
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Refresh goals and motivations
      const goals = await goalService.getUserGoals(user.uid);
      const motivations = await chatService.getUserMotivations(user.uid);
      
      setUserGoals(goals);
      setUserMotivations(motivations);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSending(false);
    }
  }, [user, conversationId, userGoals, userMotivations]);
  
  // Custom UI components
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#F0F4F8',
          },
          right: {
            backgroundColor: '#3B82F6',
          },
        }}
        textStyle={{
          left: {
            color: '#1F2937',
          },
          right: {
            color: '#FFFFFF',
          },
        }}
      />
    );
  };
  
  const renderSend = (props: any) => {
    return (
      <Send
        {...props}
        disabled={props.text.trim().length === 0}
        containerStyle={styles.sendContainer}
      >
        <SendIcon 
          size={24} 
          color={props.text.trim().length === 0 ? '#9CA3AF' : '#3B82F6'} 
        />
      </Send>
    );
  };
  
  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };
  
  const renderDay = (props: any) => {
    return (
      <Day
        {...props}
        textStyle={styles.dayText}
        wrapperStyle={styles.dayWrapper}
      />
    );
  };
  
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  };
  
  const renderMessageText = (props: any) => {
    return (
      <Message.Text
        {...props}
        parsePatterns={() => [
          {
            pattern: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
            style: { textDecorationLine: 'underline', color: props.position === 'left' ? '#3B82F6' : '#E0E7FF' },
          },
        ]}
      />
    );
  };
  
  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text 
          style={styles.errorRetry}
          onPress={() => {
            setError(null);
            isInitializedRef.current = false;
            setLoading(true);
          }}
        >
          Tap to retry
        </Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{
          _id: user?.uid || 'unknown',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        renderDay={renderDay}
        renderLoading={renderLoading}
        renderMessageText={renderMessageText}
        isLoadingEarlier={loading}
        scrollToBottom
        scrollToBottomComponent={() => <View />}
        isTyping={sending}
        placeholder="Message Miles..."
        alwaysShowSend
        minInputToolbarHeight={60}
        maxComposerHeight={120}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorRetry: {
    fontSize: 16,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  sendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 5,
    width: 40,
    height: 40,
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  dayWrapper: {
    marginVertical: 20,
  },
  dayText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ChatUI;
