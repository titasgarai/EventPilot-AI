import { EventPlan, UserProfile } from '../types';
import { DEMO_EVENT } from '../data/demoEvent';

const STORAGE_KEY_EVENTS = 'eventpilot_events_v1';
const STORAGE_KEY_ACTIVE_ID = 'eventpilot_active_id_v1';
const STORAGE_KEY_CUSTOM_API_KEY = 'eventpilot_gemini_key_v1';
const STORAGE_KEY_USER_PROFILE = 'eventpilot_user_v1';

export function getStoredEvents(): EventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      // Initialize with demo event
      const initial = [DEMO_EVENT];
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [DEMO_EVENT];
    }
    return parsed;
  } catch (e) {
    console.error('Failed to read events from localStorage', e);
    return [DEMO_EVENT];
  }
}

export function saveStoredEvents(events: EventPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events to localStorage', e);
  }
}

export function getActiveEventId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (active) return active;
    const events = getStoredEvents();
    if (events.length > 0) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, events[0].id);
      return events[0].id;
    }
  } catch (e) {
    console.error(e);
  }
  return DEMO_EVENT.id;
}

export function setActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function getActiveEvent(): EventPlan {
  const events = getStoredEvents();
  const activeId = getActiveEventId();
  const found = events.find((e) => e.id === activeId);
  return found || events[0] || DEMO_EVENT;
}

export function saveEvent(updated: EventPlan): EventPlan[] {
  const events = getStoredEvents();
  const index = events.findIndex((e) => e.id === updated.id);
  let newEvents: EventPlan[];
  if (index >= 0) {
    newEvents = [...events];
    newEvents[index] = { ...updated, updatedAt: new Date().toISOString() };
  } else {
    newEvents = [{ ...updated, updatedAt: new Date().toISOString() }, ...events];
  }
  saveStoredEvents(newEvents);
  return newEvents;
}

export function deleteEvent(id: string): EventPlan[] {
  const events = getStoredEvents();
  const filtered = events.filter((e) => e.id !== id);
  const remaining = filtered.length > 0 ? filtered : [DEMO_EVENT];
  saveStoredEvents(remaining);
  if (getActiveEventId() === id) {
    setActiveEventId(remaining[0].id);
  }
  return remaining;
}

export function duplicateEvent(id: string): { events: EventPlan[]; newEvent: EventPlan } {
  const events = getStoredEvents();
  const target = events.find((e) => e.id === id) || DEMO_EVENT;
  const newEvent: EventPlan = {
    ...target,
    id: `event-${Date.now()}`,
    name: `${target.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false,
  };
  const updated = [newEvent, ...events];
  saveStoredEvents(updated);
  setActiveEventId(newEvent.id);
  return { events: updated, newEvent };
}

export function resetDemoEvent(): EventPlan[] {
  const events = getStoredEvents();
  const filtered = events.filter((e) => e.id !== DEMO_EVENT.id);
  const updated = [DEMO_EVENT, ...filtered];
  saveStoredEvents(updated);
  setActiveEventId(DEMO_EVENT.id);
  return updated;
}

export function getCustomApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_API_KEY) || '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_API_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    console.error('Failed to read user profile', e);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
  } catch (e) {
    console.error('Failed to clear user profile', e);
  }
}
