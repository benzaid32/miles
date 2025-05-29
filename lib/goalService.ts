import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { GoalSchema, Goal, openaiService } from '@/lib/openai';
import { z } from 'zod';
import { nanoid } from '@/lib/utils';

// Define types for milestone
export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean().default(false),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

// Goal service for managing goals in Firestore
class GoalService {
  private readonly goalsCollection = 'goals';
  
  // Create a new goal
  public async createGoal(
    userId: string, 
    goalData: { 
      title: string; 
      description?: string;
      milestones?: Omit<Milestone, 'id'>[]
    }
  ): Promise<Goal> {
    try {
      const goalId = nanoid();
      const timestamp = Date.now();
      
      // Format milestones with IDs if provided
      const formattedMilestones = goalData.milestones 
        ? goalData.milestones.map(milestone => ({
            ...milestone,
            id: nanoid(),
            completed: milestone.completed || false,
            progress: milestone.progress || 0,
            createdAt: timestamp,
            updatedAt: timestamp
          }))
        : [];
      
      // Create goal object
      const goal: Goal = {
        id: goalId,
        userId,
        title: goalData.title,
        description: goalData.description,
        milestones: formattedMilestones,
        progress: 0,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Validate with Zod schema
      const validatedGoal = GoalSchema.parse(goal);
      
      // Save to Firestore
      const goalRef = doc(db, this.goalsCollection, goalId);
      await setDoc(goalRef, validatedGoal);
      
      return validatedGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create goal');
    }
  }

  // Get all goals for a user
  public async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        collection(db, this.goalsCollection),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(goalsQuery);
      const goals: Goal[] = [];
      
      querySnapshot.forEach(doc => {
        try {
          const goalData = doc.data() as Record<string, any>;
          const validatedGoal = GoalSchema.parse(goalData);
          goals.push(validatedGoal);
        } catch (error) {
          console.error(`Error validating goal ${doc.id}:`, error);
        }
      });
      
      return goals;
    } catch (error) {
      console.error('Error fetching user goals:', error);
      throw new Error('Failed to fetch goals');
    }
  }

  // Get a single goal by ID
  public async getGoal(goalId: string): Promise<Goal | null> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        return null;
      }
      
      const goalData = goalDoc.data() as Record<string, any>;
      return GoalSchema.parse(goalData);
    } catch (error) {
      console.error(`Error fetching goal ${goalId}:`, error);
      throw new Error('Failed to fetch goal');
    }
  }

  // Update a goal
  public async updateGoal(goalId: string, updateData: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>): Promise<Goal> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error('Goal not found');
      }
      
      const currentGoal = goalDoc.data() as Goal;
      
      // Ensure user cannot change userId or created date
      const updatedGoal = {
        ...currentGoal,
        ...updateData,
        id: currentGoal.id,
        userId: currentGoal.userId,
        createdAt: currentGoal.createdAt,
        updatedAt: Date.now()
      };
      
      // Validate with schema
      const validatedGoal = GoalSchema.parse(updatedGoal);
      
      // Update in Firestore
      await updateDoc(goalRef, validatedGoal);
      
      return validatedGoal;
    } catch (error) {
      console.error(`Error updating goal ${goalId}:`, error);
      throw new Error('Failed to update goal');
    }
  }

  // Delete a goal
  public async deleteGoal(goalId: string): Promise<void> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error(`Error deleting goal ${goalId}:`, error);
      throw new Error('Failed to delete goal');
    }
  }

  // Add a milestone to a goal
  public async addMilestone(goalId: string, milestoneData: Omit<Milestone, 'id'>): Promise<Goal> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error('Goal not found');
      }
      
      const currentGoal = goalDoc.data() as Goal;
      const timestamp = Date.now();
      
      // Create new milestone
      const newMilestone: Milestone = {
        ...milestoneData,
        id: nanoid(),
        completed: milestoneData.completed || false,
        progress: milestoneData.progress || 0,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Add to milestones array
      const updatedGoal = {
        ...currentGoal,
        milestones: [...currentGoal.milestones, newMilestone],
        updatedAt: timestamp
      };
      
      // Validate with schema
      const validatedGoal = GoalSchema.parse(updatedGoal);
      
      // Update in Firestore
      await updateDoc(goalRef, validatedGoal);
      
      return validatedGoal;
    } catch (error) {
      console.error(`Error adding milestone to goal ${goalId}:`, error);
      throw new Error('Failed to add milestone');
    }
  }

  // Update a milestone
  public async updateMilestone(goalId: string, milestoneId: string, updateData: Partial<Omit<Milestone, 'id'>>): Promise<Goal> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error('Goal not found');
      }
      
      const currentGoal = goalDoc.data() as Goal;
      const timestamp = Date.now();
      
      // Find and update the milestone
      const updatedMilestones = currentGoal.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            ...updateData,
            id: milestoneId,
            updatedAt: timestamp
          };
        }
        return milestone;
      });
      
      // Calculate goal progress based on milestone progress and completion
      const totalMilestones = updatedMilestones.length;
      if (totalMilestones > 0) {
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const inProgressMilestones = updatedMilestones.filter(m => !m.completed && m.progress > 0);
        
        let progressSum = completedMilestones * 100;
        inProgressMilestones.forEach(m => {
          progressSum += m.progress;
        });
        
        const overallProgress = Math.round(progressSum / totalMilestones);
        
        // Update goal with new milestones and progress
        const updatedGoal = {
          ...currentGoal,
          milestones: updatedMilestones,
          progress: overallProgress,
          updatedAt: timestamp
        };
        
        // Validate with schema
        const validatedGoal = GoalSchema.parse(updatedGoal);
        
        // Update in Firestore
        await updateDoc(goalRef, validatedGoal);
        
        return validatedGoal;
      } else {
        // Just update milestones if there are none (should not happen)
        const updatedGoal = {
          ...currentGoal,
          milestones: updatedMilestones,
          updatedAt: timestamp
        };
        
        // Validate with schema
        const validatedGoal = GoalSchema.parse(updatedGoal);
        
        // Update in Firestore
        await updateDoc(goalRef, validatedGoal);
        
        return validatedGoal;
      }
    } catch (error) {
      console.error(`Error updating milestone ${milestoneId} in goal ${goalId}:`, error);
      throw new Error('Failed to update milestone');
    }
  }

  // Delete a milestone
  public async deleteMilestone(goalId: string, milestoneId: string): Promise<Goal> {
    try {
      const goalRef = doc(db, this.goalsCollection, goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error('Goal not found');
      }
      
      const currentGoal = goalDoc.data() as Goal;
      
      // Filter out the milestone to delete
      const updatedMilestones = currentGoal.milestones.filter(
        milestone => milestone.id !== milestoneId
      );
      
      // Recalculate goal progress
      const totalMilestones = updatedMilestones.length;
      let overallProgress = 0;
      
      if (totalMilestones > 0) {
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const inProgressMilestones = updatedMilestones.filter(m => !m.completed && m.progress > 0);
        
        let progressSum = completedMilestones * 100;
        inProgressMilestones.forEach(m => {
          progressSum += m.progress;
        });
        
        overallProgress = Math.round(progressSum / totalMilestones);
      }
      
      // Update goal
      const updatedGoal = {
        ...currentGoal,
        milestones: updatedMilestones,
        progress: overallProgress,
        updatedAt: Date.now()
      };
      
      // Validate with schema
      const validatedGoal = GoalSchema.parse(updatedGoal);
      
      // Update in Firestore
      await updateDoc(goalRef, validatedGoal);
      
      return validatedGoal;
    } catch (error) {
      console.error(`Error deleting milestone ${milestoneId} from goal ${goalId}:`, error);
      throw new Error('Failed to delete milestone');
    }
  }

  // Generate milestone suggestions using AI
  public async suggestMilestones(goalTitle: string, goalDescription?: string): Promise<string[]> {
    try {
      return await openaiService.suggestMilestones(goalTitle, goalDescription);
    } catch (error) {
      console.error('Error suggesting milestones:', error);
      return [
        'Start with a small daily habit',
        'Track progress weekly',
        'Increase difficulty gradually',
        'Celebrate first major achievement',
      ];
    }
  }

  // Adjust milestones based on user performance
  public async adjustMilestones(goalId: string): Promise<Goal | null> {
    try {
      const goal = await this.getGoal(goalId);
      
      if (!goal) {
        return null;
      }
      
      // Logic for automatic milestone adjustment based on user performance
      // This is a simplified implementation
      const updatedMilestones = [...goal.milestones];
      let adjustmentsMade = false;
      
      // Example adjustment: If user is struggling with a milestone (low progress for a long time),
      // make it easier by splitting it into smaller steps
      const timestamp = Date.now();
      const oneWeekAgo = timestamp - (7 * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < updatedMilestones.length; i++) {
        const milestone = updatedMilestones[i];
        
        // If milestone has been stuck at low progress for over a week
        if (
          !milestone.completed && 
          milestone.progress < 30 && 
          milestone.updatedAt && 
          milestone.updatedAt < oneWeekAgo
        ) {
          // Split this milestone into two smaller ones
          const currentTitle = milestone.title;
          updatedMilestones[i] = {
            ...milestone,
            title: `Step 1: ${currentTitle}`,
            updatedAt: timestamp
          };
          
          // Add a new intermediate milestone
          const newMilestone: Milestone = {
            id: nanoid(),
            title: `Step 2: Continue ${currentTitle}`,
            completed: false,
            progress: 0,
            createdAt: timestamp,
            updatedAt: timestamp
          };
          
          updatedMilestones.splice(i + 1, 0, newMilestone);
          adjustmentsMade = true;
          break; // Only make one adjustment at a time
        }
      }
      
      if (adjustmentsMade) {
        // Update the goal with adjusted milestones
        return await this.updateGoal(goalId, { milestones: updatedMilestones });
      }
      
      return goal;
    } catch (error) {
      console.error(`Error adjusting milestones for goal ${goalId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const goalService = new GoalService();
export default goalService;
