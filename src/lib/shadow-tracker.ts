"use client";

import { v4 as uuidv4 } from 'uuid';

export interface ShadowEvent {
  type: 'search' | 'view' | 'category_visit';
  adId?: string;
  categoryId?: string;
  categoryName?: string;
  category?: string;
  query?: string;
  duration?: number;
  timestamp: string;
}

class ShadowTracker {
  private guestId: string | null = null;
  private categoryScores: Record<string, number> = {}; // categorySlug -> score

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // ... existing guestId logic ...
    const storedId = localStorage.getItem('_st_id');
    if (!storedId) {
      const newId = uuidv4();
      this.guestId = btoa(newId);
      localStorage.setItem('_st_id', this.guestId);
    } else {
      this.guestId = storedId;
    }

    // Load Category Scores
    const storedScores = localStorage.getItem('_st_scores');
    if (storedScores) {
      try {
        this.categoryScores = JSON.parse(storedScores);
      } catch (e) {
        this.categoryScores = {};
      }
    }
  }

  public trackEvent(event: Omit<ShadowEvent, 'timestamp'>) {
    if (typeof window === 'undefined') return;

    const track = () => {
      const shadowEvent: ShadowEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };

      const buffer = JSON.parse(localStorage.getItem('_st_buffer') || '[]');
      buffer.push(shadowEvent);
      localStorage.setItem('_st_buffer', JSON.stringify(buffer));

      // 2. Weight System: Update scores based on category visits
      if (event.type === 'view' && event.category) {
        this.updateScore(event.category, 2); // View = 2 points
      } else if (event.type === 'category_visit' && event.category) {
        this.updateScore(event.category, 5); // Direct Category Visit = 5 points
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(track);
    } else {
      setTimeout(track, 1);
    }
  }

  private updateScore(category: string, weight: number) {
    this.categoryScores[category] = (this.categoryScores[category] || 0) + weight;
    localStorage.setItem('_st_scores', JSON.stringify(this.categoryScores));

    // Smart Profiling: Add tag if score > 10
    if (this.categoryScores[category] >= 10) {
      const tags = JSON.parse(localStorage.getItem('_st_tags') || '[]');
      const interestTag = `interest:${category.toLowerCase()}`;
      if (!tags.includes(interestTag)) {
        tags.push(interestTag);
        localStorage.setItem('_st_tags', JSON.stringify(tags));
      }
    }
  }

  public getCategoryScores() {
    return this.categoryScores;
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
