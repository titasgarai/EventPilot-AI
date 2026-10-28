import React, { useState, useEffect } from 'react';
import { EventPlan, UserProfile } from '@/types';
import {
  getStoredEvents,
  saveStoredEvents,
  setActiveEventId,
  getActiveEvent,
  saveEvent,
  deleteEvent,
  duplicateEvent,
  resetDemoEvent,
  getUserProfile,
  clearUserProfile,
} from '@/utils';
import { Navbar, Sidebar, ActiveTab, ToastProvider, useToast, ApiKeyModal } from '@/components/common';
import { MyEventsModal } from '@/components/events';

// Views
import {
  LandingPage,
  DashboardView,
  CreateEventView,
  EventDetailsView,
  BudgetView,
  TimelineView,
  VendorsView,
  AIIdeasView,
  AIAssistantView,
  WelcomeView,
} from '@/views';

function AppContent() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getUserProfile());
  const [events, setEvents] = useState<EventPlan[]>(() => getStoredEvents());
  const [activeEvent, setActiveEvent] = useState<EventPlan>(() => getActiveEvent());
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMyEventsOpen, setIsMyEventsOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { showToast } = useToast();

  // Sync active event if events list changes
  useEffect(() => {
    const active = events.find((e) => e.id === activeEvent.id) || events[0];
    if (active && active.id !== activeEvent.id) {
      setActiveEvent(active);
      setActiveEventId(active.id);
    }
  }, [events, activeEvent.id]);

  const handleSelectEvent = (id: string) => {
    const found = events.find((e) => e.id === id);
    if (found) {
      setActiveEvent(found);
      setActiveEventId(id);
      showToast(`Switched to "${found.name}"`, 'info');
    }
  };

  const handleUpdateEvent = (updated: EventPlan) => {
    const updatedList = saveEvent(updated);
    setEvents(updatedList);
    setActiveEvent(updated);
  };

  const handlePlanCreated = (newPlan: EventPlan) => {
    const updatedList = [newPlan, ...events];
    saveStoredEvents(updatedList);
    setEvents(updatedList);
    setActiveEvent(newPlan);
    setActiveEventId(newPlan.id);
    setCurrentTab('dashboard');
  };

  const handleDuplicate = (id: string) => {
    const res = duplicateEvent(id);
    setEvents(res.events);
    setActiveEvent(res.newEvent);
    showToast(`Duplicated "${res.newEvent.name}"`, 'success');
  };

  const handleDelete = (id: string) => {
    const remaining = deleteEvent(id);
    setEvents(remaining);
    setActiveEvent(remaining[0]);
    showToast('Event deleted', 'info');
  };

  const handleResetDemo = () => {
    const restored = resetDemoEvent();
    setEvents(restored);
    setActiveEvent(restored[0]);
    showToast('Loaded Showcase Demo Event: Ananya & Arjun', 'success');
  };

  const handleLogout = () => {
    clearUserProfile();
    setUserProfile(null);
    showToast('Signed out of local session', 'info');
  };

  // If no user session exists, display the Welcome / Sign-In screen
  if (!userProfile) {
    return (
      <WelcomeView
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          setCurrentTab('dashboard');
          showToast(`Welcome, ${profile.name}!`, 'success');
        }}
        onExploreDemo={() => {
          handleResetDemo();
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeEvent={activeEvent}
        events={events}
        userProfile={userProfile}
        onSelectEvent={handleSelectEvent}
        onOpenMyEvents={() => setIsMyEventsOpen(true)}
        onOpenCreateEvent={() => setCurrentTab('create')}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onResetDemo={handleResetDemo}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onNavigateHome={() => setCurrentTab('landing')}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      {currentTab === 'landing' ? (
        <LandingPage
          onStartPlanning={() => setCurrentTab('create')}
          onTryDemo={() => {
            handleResetDemo();
            setCurrentTab('dashboard');
          }}
          demoEvent={activeEvent}
        />
      ) : currentTab === 'create' ? (
        <main className="flex-1 bg-slate-50">
          <CreateEventView
            onPlanCreated={handlePlanCreated}
            onCancel={() => setCurrentTab('dashboard')}
          />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Persistent Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            activeEvent={activeEvent}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenMyEvents={() => setIsMyEventsOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
            {currentTab === 'dashboard' && (
              <DashboardView
                event={activeEvent}
                onNavigateTab={setCurrentTab}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            {currentTab === 'details' && (
              <EventDetailsView
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            {currentTab === 'budget' && (
              <BudgetView
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            {currentTab === 'timeline' && (
              <TimelineView
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            {currentTab === 'vendors' && (
              <VendorsView
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            {currentTab === 'ideas' && (
              <AIIdeasView
                event={activeEvent}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            {currentTab === 'assistant' && (
              <AIAssistantView
                event={activeEvent}
              />
            )}
          </main>
        </div>
      )}

      {/* Reusable Modals */}
      <MyEventsModal
        isOpen={isMyEventsOpen}
        onClose={() => setIsMyEventsOpen(false)}
        events={events}
        activeEventId={activeEvent.id}
        onSelectEvent={handleSelectEvent}
        onDuplicateEvent={handleDuplicate}
        onDeleteEvent={handleDelete}
        onOpenCreateNew={() => setCurrentTab('create')}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={() => {
          setEvents([...events]);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
