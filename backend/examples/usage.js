/**
 * Example usage of all Firebase services
 * This file demonstrates how to use each service in your React components
 */

import { AuthService } from './services/authService.js';
import { UserService } from './services/userService.js';
import { NotesService } from './services/notesService.js';
import { EventService } from './services/eventService.js';
import { QueryService } from './services/queryService.js';
import { InfrastructureService } from './services/infrastructureService.js';

/**
 * AUTHENTICATION EXAMPLES
 */
export const authExamples = {
  
  // Student Registration
  async registerStudent() {
    try {
      const result = await AuthService.signUpStudent({
        email: 'student@vrsec.ac.in',
        password: 'password123',
        name: 'John Doe',
        branch: 'CSE',
        semester: '3'
      });
      console.log('Student registered:', result);
      return result;
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  },

  // Admin Creation (manual process)
  async createAdmin() {
    try {
      const result = await AuthService.createAdmin({
        email: 'admin@vrsec.ac.in',
        password: 'adminpassword',
        name: 'Admin User'
      });
      console.log('Admin created:', result);
      return result;
    } catch (error) {
      console.error('Admin creation failed:', error.message);
      throw error;
    }
  },

  // User Login
  async loginUser() {
    try {
      const result = await AuthService.signIn('student@vrsec.ac.in', 'password123');
      console.log('User logged in:', result);
      return result;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  },

  // User Logout
  async logoutUser() {
    try {
      await AuthService.signOutUser();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error.message);
      throw error;
    }
  }
};

/**
 * NOTES SYSTEM EXAMPLES
 */
export const notesExamples = {
  
  // Upload a note (from file input in React component)
  async uploadNote(file, userData) {
    try {
      const noteId = await NotesService.uploadNote({
        file: file, // File object from input
        title: 'Data Structures Notes',
        subject: 'Data Structures',
        branch: userData.branch,
        semester: userData.semester,
        uploaderId: userData.uid,
        uploaderName: userData.name,
        uploaderRole: userData.role
      });
      console.log('Note uploaded with ID:', noteId);
      return noteId;
    } catch (error) {
      console.error('Note upload failed:', error.message);
      throw error;
    }
  },

  // Get notes for student's branch and semester
  async getMyNotes(userData) {
    try {
      const notes = await NotesService.getNotesByBranchAndSemester(
        userData.branch, 
        userData.semester
      );
      console.log('Notes for your branch and semester:', notes);
      return notes;
    } catch (error) {
      console.error('Failed to fetch notes:', error.message);
      throw error;
    }
  },

  // Search notes
  async searchNotes(searchTerm) {
    try {
      const notes = await NotesService.searchNotes(searchTerm);
      console.log('Search results:', notes);
      return notes;
    } catch (error) {
      console.error('Search failed:', error.message);
      throw error;
    }
  },

  // Get user's uploaded notes
  async getMyUploads(userId) {
    try {
      const notes = await NotesService.getNotesByUser(userId);
      console.log('Your uploaded notes:', notes);
      return notes;
    } catch (error) {
      console.error('Failed to fetch uploads:', error.message);
      throw error;
    }
  }
};

/**
 * EVENTS SYSTEM EXAMPLES
 */
export const eventExamples = {
  
  // Create an event (admin only)
  async createEvent() {
    try {
      const eventId = await EventService.createEvent({
        title: 'Tech Fest 2026',
        branch: 'CSE',
        type: 'Technical',
        date: '2026-03-15',
        venue: 'Main Auditorium',
        description: 'Annual technical festival with various competitions',
        registerLink: 'https://example.com/register',
        organizerName: 'Dr. Smith',
        organizerPhone: '+91-9876543210'
      });
      console.log('Event created with ID:', eventId);
      return eventId;
    } catch (error) {
      console.error('Event creation failed:', error.message);
      throw error;
    }
  },

  // Get events for student's branch
  async getBranchEvents(branch) {
    try {
      const events = await EventService.getEventsByBranch(branch);
      console.log('Events for your branch:', events);
      return events;
    } catch (error) {
      console.error('Failed to fetch events:', error.message);
      throw error;
    }
  },

  // Get upcoming events
  async getUpcomingEvents() {
    try {
      const events = await EventService.getUpcomingEvents();
      console.log('Upcoming events:', events);
      return events;
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error.message);
      throw error;
    }
  }
};

/**
 * QUERY SYSTEM EXAMPLES
 */
export const queryExamples = {
  
  // Student creates a query
  async createQuery(userData) {
    try {
      const queryId = await QueryService.createQuery({
        userId: userData.uid,
        studentName: userData.name,
        subject: 'Machine Learning',
        message: 'I need notes for supervised learning algorithms, especially SVM and Random Forest'
      });
      console.log('Query created with ID:', queryId);
      return queryId;
    } catch (error) {
      console.error('Query creation failed:', error.message);
      throw error;
    }
  },

  // Get student's queries
  async getMyQueries(userId) {
    try {
      const queries = await QueryService.getQueriesByUser(userId);
      console.log('Your queries:', queries);
      return queries;
    } catch (error) {
      console.error('Failed to fetch queries:', error.message);
      throw error;
    }
  },

  // Admin gets pending queries
  async getPendingQueries() {
    try {
      const queries = await QueryService.getPendingQueries();
      console.log('Pending queries:', queries);
      return queries;
    } catch (error) {
      console.error('Failed to fetch pending queries:', error.message);
      throw error;
    }
  },

  // Admin marks query as completed
  async completeQuery(queryId) {
    try {
      await QueryService.markQueryCompleted(queryId);
      console.log('Query marked as completed');
    } catch (error) {
      console.error('Failed to complete query:', error.message);
      throw error;
    }
  }
};

/**
 * LEADERBOARD EXAMPLES
 */
export const leaderboardExamples = {
  
  // Get top students leaderboard
  async getLeaderboard() {
    try {
      const leaderboard = await UserService.getLeaderboard(10);
      console.log('Top 10 students:', leaderboard);
      return leaderboard;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error.message);
      throw error;
    }
  },

  // Get notes statistics
  async getNotesStats() {
    try {
      const stats = await NotesService.getNotesStats();
      console.log('Notes statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to fetch notes stats:', error.message);
      throw error;
    }
  }
};

/**
 * INFRASTRUCTURE EXAMPLES
 */
export const infrastructureExamples = {
  
  // Create a facility (admin only)
  async createFacility() {
    try {
      const facilityId = await InfrastructureService.createFacility({
        name: 'Library',
        description: 'Central library with study halls, computer lab, and book collection',
        timings: '8:00 AM - 8:00 PM (Mon-Sat)',
        mapUrl: 'https://maps.google.com/?q=VRSEC+Library'
      });
      console.log('Facility created with ID:', facilityId);
      return facilityId;
    } catch (error) {
      console.error('Facility creation failed:', error.message);
      throw error;
    }
  },

  // Get all facilities
  async getAllFacilities() {
    try {
      const facilities = await InfrastructureService.getAllFacilities();
      console.log('All facilities:', facilities);
      return facilities;
    } catch (error) {
      console.error('Failed to fetch facilities:', error.message);
      throw error;
    }
  },

  // Search facilities
  async searchFacilities(searchTerm) {
    try {
      const facilities = await InfrastructureService.searchFacilities(searchTerm);
      console.log('Search results:', facilities);
      return facilities;
    } catch (error) {
      console.error('Search failed:', error.message);
      throw error;
    }
  }
};

/**
 * REACT COMPONENT USAGE EXAMPLE
 */
export const reactComponentExample = `
// Example React component using the services
import React, { useState, useEffect } from 'react';
import { AuthService } from '../backend/services/authService.js';
import { NotesService } from '../backend/services/notesService.js';

function NotesUpload() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      await NotesService.uploadNote({
        file: file,
        title: 'Sample Notes',
        subject: 'Computer Science',
        branch: user.branch,
        semester: user.semester,
        uploaderId: user.uid,
        uploaderName: user.name,
        uploaderRole: user.role
      });
      alert('Notes uploaded successfully!');
      setFile(null);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleFileUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload Notes'}
      </button>
    </div>
  );
}
`;