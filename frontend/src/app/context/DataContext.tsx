import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Note, Event, Facility, Query } from '@/app/types';
import { UserService } from '../../services/userService';
import { EventService } from '../../services/eventService';
import { NotesService } from '../../services/notesService';

interface DataContextType {
  notes: Note[];
  events: Event[];
  facilities: Facility[];
  queries: Query[];
  leaderboard: { rank: number; name: string; points: number; email?: string; branch?: string; semester?: string }[];
  addNote: (note: Note) => void;
  addEvent: (event: Event) => Promise<string>;
  addQuery: (query: Query) => void;
  updateQueryStatus: (id: string, status: 'Pending' | 'Completed') => void;
  refreshLeaderboard: () => Promise<void>;  refreshNotes: () => Promise<void>;}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Start with empty data - admin will add content
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [facilities] = useState<Facility[]>([
    {
      id: '1',
      name: 'Central Library',
      type: 'Library',
      timings: '8:00 AM - 8:00 PM',
      description: 'Vast collection of over 50,000 books, journals, and digital resources.',
      locationUrl: 'https://maps.google.com'
    },
    {
      id: '2',
      name: 'Computer Labs',
      type: 'Lab',
      timings: '9:00 AM - 5:00 PM',
      description: 'High-performance computing clusters with latest software.',
      locationUrl: 'https://maps.google.com'
    },
    {
      id: '3',
      name: 'Sports Complex',
      type: 'Sports',
      timings: '6:00 AM - 7:00 PM',
      description: 'Indoor stadium, gym, and outdoor tracks.',
      locationUrl: 'https://maps.google.com'
    }
  ]);

  const [queries, setQueries] = useState<Query[]>([]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Loading leaderboard...', points: 0 }
  ]);

  // Fetch real leaderboard data
  const fetchLeaderboard = async () => {
    try {
      console.log('🔄 Fetching leaderboard data...');
      const leaderboardData = await UserService.getLeaderboard(10);
      const formattedLeaderboard = leaderboardData.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        points: user.points,
        email: user.email,
        branch: user.branch,
        semester: user.semester
      }));
      console.log('✅ Leaderboard loaded:', formattedLeaderboard);
      setLeaderboard(formattedLeaderboard);
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      setLeaderboard([
        { rank: 1, name: 'Error loading leaderboard. Try refreshing!', points: 0 }
      ]);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchEvents();
    fetchNotes();
    
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshLeaderboard = async () => {
    await fetchLeaderboard();
  };

  const refreshNotes = async () => {
    await fetchNotes();
  };

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      console.log('🔄 Fetching events from Firebase...');
      const eventsData = await EventService.getAllEvents();
      console.log('✅ Events loaded:', eventsData.length);
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch notes from Firebase
  const fetchNotes = async () => {
    try {
      console.log('🔄 Fetching notes from Firebase...');
      const notesData = await NotesService.getAllNotes();
      console.log('✅ Notes loaded:', notesData.length);
      console.log('🔍 First note sample:', notesData[0]);
      setNotes(notesData);
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const addNote = async (note: Note) => {
    // Notes are actually uploaded via NotesService.uploadNote() in the PDFUpload component
    // This function just refreshes the notes list after upload
    try {
      console.log('🔄 Refreshing notes list...');
      await fetchNotes();
    } catch (error) {
      console.error('❌ Error refreshing notes:', error);
      // Fallback to adding to local state
      setNotes([note, ...notes]);
    }
  };

  const addEvent = async (event: Event) => {
    try {
      console.log('💾 Saving event to Firebase...', event);
      
      // Prepare event data for Firebase (matching EventService interface)
      const eventData = {
        title: event.title,
        branch: event.branch || 'ALL',
        type: event.type || 'Technical',
        date: event.date,
        venue: event.venue || 'Main Auditorium',
        description: event.description || 'New event added by admin.',
        registerLink: event.registerLink || '#',
        organizerName: 'Admin',
        organizerPhone: 'N/A'
      };
      
      const eventId = await EventService.createEvent(eventData);
      console.log('✅ Event saved with ID:', eventId);
      
      // Add the saved event to local state with the returned ID
      const savedEvent = { ...event, id: eventId };
      setEvents([savedEvent, ...events]);
      
      return eventId;
    } catch (error) {
      console.error('❌ Error saving event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      console.log('🗑️ Deleting event from Firebase...', eventId);
      
      // Delete from Firebase
      await EventService.deleteEvent(eventId);
      console.log('✅ Event deleted from Firebase');
      
      // Remove from local state
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw error;
    }
  };

  const addQuery = (query: Query) => {
    setQueries([query, ...queries]);
  };

  const updateQueryStatus = (id: string, status: 'Pending' | 'Completed') => {
    setQueries(queries.map(q => q.id === id ? { ...q, status } : q));
  };

  return (
    <DataContext.Provider value={{ notes, events, facilities, queries, leaderboard, addNote, addEvent, deleteEvent, addQuery, updateQueryStatus, refreshLeaderboard, refreshNotes }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
