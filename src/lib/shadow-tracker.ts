"use client";

import { v4 as uuidv4 } from 'uuid';

export interface ShadowEvent {
  type: 'search' | 'view';
  adId?: string;
  category?: string;
  query?: string;
  duration?: number;
  timestamp: string;
}

class ShadowTracker {
  private guestId: string | null = null;
  private interests: Record<string, number> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // 1. Initial Setup: Check or create guest_id
    const storedId = localStorage.getItem('_st_id');
    if (!storedId) {
      const newId = uuidv4();
      this.guestId = btoa(newId); // Base64 encoding
      localStorage.setItem('_st_id', this.guestId);
    } else {
      this.guestId = storedId;
    }

    // Load interests
    const storedInterests = localStorage.getItem('_st_interests');
    if (storedInterests) {
      try {
        this.interests = JSON.parse(storedInterests);
      } catch (e) {
        this.interests = {};
      }
    }
  }

  // 2. Event Capture: Search and View
  public trackEvent(event: Omit<ShadowEvent, 'timestamp'>) {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback to optimize performance (LCP protection)
    const track = () => {
      const shadowEvent: ShadowEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };

      // Store in buffer
      const buffer = JSON.parse(localStorage.getItem('_st_buffer') || '[]');
      buffer.push(shadowEvent);
      localStorage.setItem('_st_buffer', JSON.stringify(buffer));

      // 3. Smart Profiling Logic: Detect interests
      if (event.type === 'view' && event.category) {
        this.updateInterests(event.category);
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(track);
    } else {
      setTimeout(track, 1);
    }
  }

  private updateInterests(category: string) {
    this.interests[category] = (this.interests[category] || 0) + 1;
    localStorage.setItem('_st_interests', JSON.stringify(this.interests));

    // If category seen > 3 times, it's an interest
    if (this.interests[category] >= 3) {
      const tags = JSON.parse(localStorage.getItem('_st_tags') || '[]');
      const interestTag = `interest:${category.toLowerCase()}`;
      if (!tags.includes(interestTag)) {
        tags.push(interestTag);
        localStorage.setItem('_st_tags', JSON.stringify(tags));
      }
    }
  }

  public getGuestId() {
    return this.guestId;
  }

  public getBuffer() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('_st_buffer') || '[]');
  }

  public clearBuffer() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('_st_buffer');
  }
}

export const shadowTracker = new ShadowTracker();
