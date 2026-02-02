import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { NotesService, UploadNoteData } from '../../services/notesService';
import { useAuth } from '../context/AuthContext';

const BRANCHES = [
  'CSE',
  'ECE', 
  'MECH',
  'CIVIL',
  'EEE',
  'IT',
  'CHEMICAL',
  'BIOTECH',
  'AERONAUTICAL',
  'AUTOMOBILE',
  'MINING',
  'METALLURGY',
  'TEXTILE',
  'FOOD TECHNOLOGY',
  'ENVIRONMENTAL',
  'MARINE',
  'PETROLEUM',
  'INSTRUMENTATION',
  'PRODUCTION',
  'INDUSTRIAL',
  'AGRICULTURAL',
  'FORESTRY'
];

const SEMESTERS = [
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th',
  '1', '2', '3', '4', '5', '6', '7', '8',
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'
];

const COMMON_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Programming',
  'Data Structures',
  'Algorithms',
  'Database Systems',
  'Computer Networks',
  'Operating Systems',
  'Software Engineering',
  'Machine Learning',
  'Artificial Intelligence',
  'Web Development',
  'Mobile App Development',
  'Computer Graphics',
  'Digital Signal Processing',
  'Microprocessors',
  'VLSI Design',
  'Control Systems',
  'Power Systems',
  'Electronics',
  'Communication Systems',
  'Thermodynamics',
  'Fluid Mechanics',
  'Heat Transfer',
  'Manufacturing Technology',
  'Material Science',
  'Strength of Materials',
  'Structural Analysis',
  'Concrete Technology',
  'Surveying',
  'Geotechnical Engineering',
  'Environmental Engineering'
];

interface PDFUploadProps {
  onUploadSuccess?: () => void;
  allowedBranches?: string[];
  allowedSemesters?: string[];
}

export const PDFUpload = ({ 
  onUploadSuccess, 
  allowedBranches = BRANCHES, 
  allowedSemesters = SEMESTERS 
}: PDFUploadProps) => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    branch: '',
    semester: '',
    customSubject: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Update form data when userData changes
  useEffect(() => {
    if (userData?.branch && !formData.branch) {
      setFormData(prev => ({
        ...prev,
        branch: userData.branch
      }));
    }
    if (userData?.semester && !formData.semester) {
      setFormData(prev => ({
        ...prev,
        semester: userData.semester
      }));
    }
  }, [userData]);

  const handleInputChange = (name: string, value: string) => {
    console.log(`🔄 Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 File input triggered:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('📄 File selected:', { name: file.name, size: file.size, type: file.type });
      
      // Validate file type
      if (!file.type.includes('pdf')) {
        console.error('❌ Invalid file type:', file.type);
        setAlert({
          type: 'error',
          message: 'Please select only PDF files'
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.error('❌ File too large:', file.size, 'bytes');
        setAlert({
          type: 'error',
          message: 'File size should not exceed 10MB'
        });
        return;
      }

      setSelectedFile(file);
      setAlert(null);
      console.log('✅ File selected successfully');
    } else {
      console.log('❌ No file selected');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setAlert({ type: 'error', message: 'Please enter a title' });
      return false;
    }

    if (!formData.subject && !formData.customSubject.trim()) {
      setAlert({ type: 'error', message: 'Please select or enter a subject' });
      return false;
    }

    if (!formData.branch) {
      setAlert({ type: 'error', message: 'Please select a branch' });
      return false;
    }

    if (!formData.semester) {
      setAlert({ type: 'error', message: 'Please select a semester' });
      return false;
    }

    if (!selectedFile) {
      setAlert({ type: 'error', message: 'Please select a PDF file' });
      return false;
    }

    if (!user || !userData) {
      setAlert({ type: 'error', message: 'You must be logged in to upload notes' });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;
    
    if (!userData || !userData.uid) {
      setAlert({
        type: 'error',
        message: 'User authentication error. Please refresh and try again.'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadData: UploadNoteData = {
        file: selectedFile!,
        title: formData.title.trim(),
        subject: formData.customSubject.trim() || formData.subject,
        branch: formData.branch,
        semester: formData.semester,
        uploaderId: userData!.uid,
        uploaderName: userData!.name,
        uploaderRole: userData!.role as 'student' | 'admin'
      };

      const noteId = await NotesService.uploadNote(uploadData);
      
      setUploadProgress(100);
      
      setAlert({
        type: 'success',
        message: 'PDF uploaded successfully! Students can now download your notes.'
      });

      // Reset form
      setFormData({
        title: '',
        subject: '',
        branch: userData?.branch || '',
        semester: userData?.semester || '',
        customSubject: ''
      });
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
        fileInput.files = null;
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to upload PDF. Please try again.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user || !userData) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              Please log in to upload PDF notes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          📚 Upload PDF Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {alert && (
          <Alert className={`${
            alert.type === 'success' ? 'border-green-500 bg-green-50' :
            alert.type === 'error' ? 'border-red-500 bg-red-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <AlertDescription className={`${
              alert.type === 'success' ? 'text-green-700' :
              alert.type === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Data Structures and Algorithms Notes"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* Branch */}
          <div>
            <Label htmlFor="branch">Branch *</Label>
            <Select 
              value={formData.branch} 
              onValueChange={(value) => handleInputChange('branch', value)}
              disabled={isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {BRANCHES.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester */}
          <div>
            <Label htmlFor="semester">Semester *</Label>
            <Select 
              value={formData.semester} 
              onValueChange={(value) => handleInputChange('semester', value)}
              disabled={isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {SEMESTERS.map(sem => (
                  <SelectItem key={sem} value={sem}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Select 
              value={formData.subject} 
              onValueChange={(value) => handleInputChange('subject', value)}
              disabled={isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {COMMON_SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Subject */}
          <div>
            <Label htmlFor="customSubject">Or Enter Custom Subject</Label>
            <Input
              id="customSubject"
              placeholder="e.g., Advanced Microprocessors"
              value={formData.customSubject}
              onChange={(e) => handleInputChange('customSubject', e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* File Upload */}
          <div className="md:col-span-2">
            <Label htmlFor="fileInput">PDF File * (Max 10MB)</Label>
            <Input
              id="fileInput"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  📄 <strong>{selectedFile.name}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Size: {formatFileSize(selectedFile.size)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? '📤 Uploading...' : '📤 Upload PDF Notes'}
        </Button>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Only PDF files are allowed</p>
          <p>• Maximum file size: 10MB</p>
          <p>• Students earn 10 points for each note upload</p>
          <p className="text-green-600 font-medium">• Powered by Cloudinary - Fast & Reliable Storage ☁️</p>
        </div>
      </CardContent>
    </Card>
  );
};