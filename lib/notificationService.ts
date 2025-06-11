import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationOptions {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

interface ScheduleOptions {
  hour: number;
  minute: number;
  repeats?: boolean;
}

class NotificationService {
  private hasPermission = false;

  async initialize(): Promise<boolean> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';

      if (!this.hasPermission) {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Miles Coaching',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleNotification(
    options: NotificationOptions,
    schedule: ScheduleOptions
  ): Promise<string | null> {
    if (!this.hasPermission) {
      console.warn('No notification permission');
      return null;
    }

    try {
      const trigger = {
        hour: schedule.hour,
        minute: schedule.minute,
        repeats: schedule.repeats ?? true,
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: options.sound !== false,
          badge: options.badge,
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleMorningRitual(hour: number = 8, minute: number = 0): Promise<string | null> {
    return this.scheduleNotification(
      {
        title: '🌅 Good morning!',
        body: 'Ready to set your intentions for today? Miles is here to help you start strong.',
        data: { type: 'morning_ritual' },
      },
      { hour, minute, repeats: true }
    );
  }

  async scheduleEveningReflection(hour: number = 20, minute: number = 0): Promise<string | null> {
    return this.scheduleNotification(
      {
        title: '🌙 Time to reflect',
        body: 'How did your day go? Let\'s celebrate your wins and plan for tomorrow.',
        data: { type: 'evening_reflection' },
      },
      { hour, minute, repeats: true }
    );
  }

  async scheduleMotivationalReminder(): Promise<string | null> {
    // Random time between 12-16 (noon to 4pm)
    const hour = Math.floor(Math.random() * 4) + 12;
    const minute = Math.floor(Math.random() * 60);

    return this.scheduleNotification(
      {
        title: '💪 You\'ve got this!',
        body: 'Remember your goals and keep pushing forward. Miles believes in you!',
        data: { type: 'motivation' },
      },
      { hour, minute, repeats: false }
    );
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Listen for notification responses
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Listen for notifications received while app is in foreground
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();
export default notificationService;