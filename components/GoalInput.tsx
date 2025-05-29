import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import goalService, { Milestone } from '@/lib/goalService';
import { Goal } from '@/lib/openai';
import * as Haptics from 'expo-haptics';
import { Check, Plus, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { z } from 'zod';

// Define validation schema for goal input
const GoalInputSchema = z.object({
  title: z.string().min(3, 'Goal title must be at least 3 characters').max(100, 'Goal title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

// Props for GoalInput component
interface GoalInputProps {
  onGoalCreated?: (goal: Goal) => void;
  onCancel?: () => void;
  existingGoal?: Goal;
  onGoalUpdated?: (goal: Goal) => void;
}

export const GoalInput: React.FC<GoalInputProps> = ({
  onGoalCreated,
  onCancel,
  existingGoal,
  onGoalUpdated
}) => {
  // State
  const [title, setTitle] = useState(existingGoal?.title || '');
  const [description, setDescription] = useState(existingGoal?.description || '');
  const [milestones, setMilestones] = useState<Omit<Milestone, 'id'>[]>(
    existingGoal?.milestones.map(m => ({
      title: m.title,
      completed: m.completed,
      progress: m.progress
    })) || []
  );
  const [newMilestone, setNewMilestone] = useState('');
  const [suggestedMilestones, setSuggestedMilestones] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Auth hook
  const { user } = useAuth();

  // Fetch milestone suggestions when title changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (title.length < 5) return;
      
      try {
        const suggestions = await goalService.suggestMilestones(title, description);
        if (suggestions.length > 0) {
          setSuggestedMilestones(suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error getting milestone suggestions:', error);
      }
    };
    
    const timer = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(timer);
  }, [title, description]);

  // Validate input
  const validateInput = (): boolean => {
    try {
      GoalInputSchema.parse({ title, description });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Add milestone
  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const milestone = {
      title: newMilestone.trim(),
      completed: false,
      progress: 0
    };
    
    setMilestones([...milestones, milestone]);
    setNewMilestone('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Remove milestone
  const removeMilestone = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Add suggested milestone
  const addSuggestedMilestone = (milestone: string) => {
    if (milestones.some(m => m.title === milestone)) return;
    
    setMilestones([...milestones, {
      title: milestone,
      completed: false,
      progress: 0
    }]);
    
    const updatedSuggestions = suggestedMilestones.filter(m => m !== milestone);
    setSuggestedMilestones(updatedSuggestions);
    
    if (updatedSuggestions.length === 0) {
      setShowSuggestions(false);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) return;
    
    if (!validateInput()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    try {
      setLoading(true);
      
      if (existingGoal) {
        // Update existing goal
        const updatedGoal = await goalService.updateGoal(existingGoal.id, {
          title,
          description,
          milestones
        });
        
        if (onGoalUpdated) {
          onGoalUpdated(updatedGoal);
        }
      } else {
        // Create new goal
        const newGoal = await goalService.createGoal(user.uid, {
          title,
          description,
          milestones
        });
        
        if (onGoalCreated) {
          onGoalCreated(newGoal);
        }
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert(
        'Error',
        'Failed to save your goal. Please try again.',
        [{ text: 'OK' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Goal Title</Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to achieve?"
            maxLength={100}
            autoFocus
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.textArea, errors.description ? styles.inputError : null]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your goal in more detail..."
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          
          <View style={styles.milestonesContainer}>
            <Text style={styles.label}>Milestones</Text>
            <Text style={styles.helperText}>
              Break your goal into smaller, achievable steps
            </Text>
            
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <Text style={styles.milestoneText} numberOfLines={2}>
                  {milestone.title}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMilestone(index)}
                >
                  <X size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.addMilestoneContainer}>
              <TextInput
                style={styles.milestoneInput}
                value={newMilestone}
                onChangeText={setNewMilestone}
                placeholder="Add a milestone..."
                onSubmitEditing={addMilestone}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !newMilestone.trim() ? styles.addButtonDisabled : null
                ]}
                onPress={addMilestone}
                disabled={!newMilestone.trim()}
              >
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {suggestedMilestones.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                  style={styles.suggestionsHeader}
                  onPress={() => setShowSuggestions(!showSuggestions)}
                >
                  <Text style={styles.suggestionsTitle}>
                    Suggested Milestones
                  </Text>
                  {showSuggestions ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
                
                {showSuggestions && (
                  <View style={styles.suggestionsList}>
                    {suggestedMilestones.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => addSuggestedMilestone(suggestion)}
                      >
                        <Text style={styles.suggestionText}>
                          {suggestion}
                        </Text>
                        <Plus size={18} color="#3B82F6" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, loading ? styles.saveButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {existingGoal ? 'Update Goal' : 'Save Goal'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    marginBottom: 16,
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addMilestoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  milestoneInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  suggestionsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: showSuggestions => showSuggestions ? 1 : 0,
    borderBottomColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  suggestionsList: {
    padding: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
  },
  suggestionText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default GoalInput;
