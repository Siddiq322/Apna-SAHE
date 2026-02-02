import React, { useState } from 'react';
import { NotesService } from '../services/notesService';
import { useAuth } from '../hooks/useAuth';

const NotesUpload: React.FC = () => {
  const { userData } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setMessage('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setMessage('File size should not exceed 10MB');
        return;
      }
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !subject || !userData) {
      setMessage('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await NotesService.uploadNote({
        file: file,
        title: title,
        subject: subject,
        branch: userData.branch,
        semester: userData.semester,
        uploaderId: userData.uid,
        uploaderName: userData.name,
        uploaderRole: userData.role
      });

      setMessage('Notes uploaded successfully! +10 points added to your account.');
      setFile(null);
      setTitle('');
      setSubject('');
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!userData) {
    return <div>Please log in to upload notes</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Notes</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notes title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subject name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PDF File
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {file && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <p>Branch: {userData.branch}</p>
          <p>Semester: {userData.semester}</p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !title || !subject || uploading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            !file || !title || !subject || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Notes (+10 Points)'}
        </button>

        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesUpload;