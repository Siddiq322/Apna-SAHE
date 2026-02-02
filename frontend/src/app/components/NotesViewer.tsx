import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { NotesService, Note } from '../../services/notesService';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const BRANCHES = [
  'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'CHEMICAL', 'BIOTECH',
  'AERONAUTICAL', 'AUTOMOBILE', 'MINING', 'METALLURGY', 'TEXTILE', 
  'FOOD TECHNOLOGY', 'ENVIRONMENTAL', 'MARINE', 'PETROLEUM', 
  'INSTRUMENTATION', 'PRODUCTION', 'INDUSTRIAL', 'AGRICULTURAL', 'FORESTRY'
];
const SEMESTERS = [
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th',
  '1', '2', '3', '4', '5', '6', '7', '8',
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'
];

interface NotesViewerProps {
  showUploadedByUser?: boolean;
  allowedBranches?: string[];
  allowedSemesters?: string[];
  maxResults?: number;
  useDataContext?: boolean; // New prop to use DataContext notes instead of local state
}

export const NotesViewer = ({ 
  showUploadedByUser = false,
  allowedBranches = BRANCHES,
  allowedSemesters = SEMESTERS,
  maxResults = 50,
  useDataContext = false
}: NotesViewerProps) => {
  const { user, userData } = useAuth();
  const { notes: contextNotes, refreshNotes } = useData();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    branch: '',
    semester: '',
    search: ''
  });

  // Load notes on component mount
  useEffect(() => {
    if (useDataContext) {
      // Use notes from DataContext
      setNotes(contextNotes.slice(0, maxResults));
    } else {
      // Load notes from API
      loadNotes();
    }
  }, [showUploadedByUser, user, useDataContext, contextNotes]);

  // Apply filters when notes or filters change
  useEffect(() => {
    applyFilters();
  }, [notes, filters]);

  const loadNotes = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let loadedNotes: Note[] = [];

      if (showUploadedByUser) {
        // Load notes uploaded by current user
        loadedNotes = await NotesService.getNotesByUser(user.uid);
      } else {
        // Load all notes
        loadedNotes = await NotesService.getAllNotes();
      }

      setNotes(loadedNotes.slice(0, maxResults));
    } catch (err: any) {
      console.error('Error loading notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];

    // Filter by branch
    if (filters.branch && filters.branch !== 'all-branches') {
      filtered = filtered.filter(note => note.branch === filters.branch);
    }

    // Filter by semester
    if (filters.semester && filters.semester !== 'all-semesters') {
      filtered = filtered.filter(note => note.semester === filters.semester);
    }

    // Filter by search term
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.subject.toLowerCase().includes(searchTerm) ||
        note.uploadedByName.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredNotes(filtered);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDownload = (note: Note) => {
    try {
      NotesService.downloadNote(note);
    } catch (error: any) {
      setError(error.message || 'Failed to download note');
    }
  };

  const handleView = (note: Note) => {
    try {
      NotesService.viewNote(note);
    } catch (error: any) {
      setError(error.message || 'Failed to view note');
    }
  };

  const handleDelete = async (note: Note) => {
    console.log('🗑️ Delete button clicked for note:', note);
    console.log('🗑️ Note ID:', note.id);
    console.log('🗑️ User:', user);
    console.log('🗑️ User ID (user.id):', user?.id);
    console.log('🗑️ UserData:', userData);
    console.log('🗑️ UserData UID:', userData?.uid);
    
    if (!user || !userData) {
      setError('Unable to delete note: User not authenticated');
      return;
    }
    
    if (!note.id) {
      setError('Unable to delete note: Note ID is missing');
      return;
    }
    
    // Use userData.uid instead of user.uid since user object uses 'id' but we need 'uid' for Firebase
    const userId = userData.uid || user.id;
    if (!userData.uid) {
      setError('Unable to delete note: User ID is missing');
      return;
    }
    
    // IMPORTANT: Double-check authorization before deletion
    if (userData.role === 'student' && note.uploaderId !== userId) {
      setError('Access Denied: Students can only delete their own notes');
      console.error('🚫 Unauthorized deletion attempt:', {
        userRole: userData.role,
        userId: userId,
        noteUploaderId: note.uploaderId,
        noteTitle: note.title
      });
      return;
    }
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${note.title}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      console.log('🚀 Starting delete operation...');
      await NotesService.deleteNote(note.id, userId);
      console.log('✅ Delete successful, refreshing notes...');
      
      if (useDataContext && refreshNotes) {
        // Refresh notes through DataContext
        await refreshNotes();
      } else {
        // Reload notes locally
        await loadNotes();
      }
      
      setError(null);
      console.log('✅ Notes refreshed successfully');
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      setError(error.message || 'Failed to delete note');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const canDelete = (note: Note): boolean => {
    if (!userData || !note) return false;
    
    // Use userData.uid for Firebase operations since user object uses 'id' 
    const userId = userData.uid || user?.id;
    
    // Admin can delete any note
    if (userData.role === 'admin') {
      console.log('🔧 Admin can delete note:', note.title);
      return true;
    }
    
    // Student can ONLY delete their own notes
    if (userData.role === 'student') {
      const canDeleteOwn = note.uploaderId === userId;
      console.log('👨‍🎓 Student delete check:', {
        noteTitle: note.title,
        noteUploaderId: note.uploaderId,
        currentUserId: userId,
        canDelete: canDeleteOwn
      });
      return canDeleteOwn;
    }
    
    return false;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              Please log in to view notes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          📚 {showUploadedByUser ? 'My Uploaded Notes' : 'Available Notes'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="branch-filter">Filter by Branch</Label>
            <Select 
              value={filters.branch || undefined} 
              onValueChange={(value) => handleFilterChange('branch', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-branches">All branches</SelectItem>
                {allowedBranches.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="semester-filter">Filter by Semester</Label>
            <Select 
              value={filters.semester || undefined} 
              onValueChange={(value) => handleFilterChange('semester', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-semesters">All semesters</SelectItem>
                {allowedSemesters.map(sem => (
                  <SelectItem key={sem} value={sem}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="search">Search Notes</Label>
            <Input
              id="search"
              placeholder="Search by title, subject, or uploader"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading notes...</p>
            </div>
          </div>
        )}

        {/* Notes List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500">
                  {notes.length === 0 
                    ? (showUploadedByUser ? 'You haven\'t uploaded any notes yet.' : 'No notes available.')
                    : 'No notes match your filters.'
                  }
                </p>
                {notes.length === 0 && !showUploadedByUser && (
                  <p className="text-sm text-gray-400 mt-2">
                    Be the first to upload and share your notes!
                  </p>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <Card key={note.id} className="border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {note.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">{note.subject}</Badge>
                          <Badge variant="outline">{note.branch}</Badge>
                          <Badge variant="outline">Sem {note.semester}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(note.fileSize)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(note)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          👁️ View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDownload(note)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          📥 Download
                        </Button>
                        {canDelete(note) && note.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(note)}
                          >
                            🗑️
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>
                        📤 Uploaded by <strong>{note.uploadedByName}</strong> ({note.uploadedByRole})
                      </p>
                      <p>📅 {formatDate(note.uploadedAt)}</p>
                      <p>📄 {note.fileName}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && notes.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {filteredNotes.length} of {notes.length} notes
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={useDataContext ? refreshNotes : loadNotes}
            disabled={isLoading}
          >
            🔄 Refresh Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};