import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  points: number;
  branch?: string;
  semester?: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      setUsers(userData);
      setMessage(`Found ${userData.length} users`);
    } catch (error: any) {
      setMessage(`Error fetching users: ${error.message}`);
    }
    setLoading(false);
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setMessage(`User "${userName}" deleted successfully`);
      await fetchAllUsers(); // Refresh the list
    } catch (error: any) {
      setMessage(`Error deleting user: ${error.message}`);
    }
  };

  const cleanupDuplicates = async () => {
    if (!confirm('This will keep only ONE SHAIK ABUBAKAR SIDDIQ as the student user and remove all duplicates. Continue?')) {
      return;
    }

    try {
      // Find all SHAIK ABUBAKAR SIDDIQ users
      const shaikUsers = users.filter(user => user.name === 'SHAIK ABUBAKAR SIDDIQ');
      
      // Keep the first one (usually the one with more data or higher points)
      const keepUser = shaikUsers.reduce((prev, current) => {
        if (current.points > prev.points) return current;
        if (current.points === prev.points && current.id < prev.id) return prev;
        return prev;
      });

      // Delete all other users (both duplicates of SHAIK and other test users)
      const usersToDelete = users.filter(user => 
        user.role === 'student' && user.id !== keepUser?.id
      );

      for (const user of usersToDelete) {
        await deleteDoc(doc(db, 'users', user.id));
      }

      setMessage(`Cleanup completed! Removed ${usersToDelete.length} users. Kept: ${keepUser?.name} (${keepUser?.email}) with ${keepUser?.points} points.`);
      await fetchAllUsers();
    } catch (error: any) {
      setMessage(`Error during cleanup: ${error.message}`);
    }
  };

  const removeAllUsersExceptAdmin = async () => {
    if (!confirm('This will REMOVE ALL USERS except the admin (siddiqshaik613@gmail.com). This cannot be undone! Continue?')) {
      return;
    }

    try {
      // Find all users except admin
      const usersToDelete = users.filter(user => 
        user.email !== 'siddiqshaik613@gmail.com' && user.role !== 'admin'
      );

      setMessage(`Deleting ${usersToDelete.length} users...`);

      for (const user of usersToDelete) {
        console.log(`Deleting user: ${user.name} (${user.email})`);
        await deleteDoc(doc(db, 'users', user.id));
      }

      setMessage(`Cleanup completed! Removed ${usersToDelete.length} users. Only admin remains.`);
      await fetchAllUsers();
    } catch (error: any) {
      setMessage(`Error during cleanup: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>User Management (Admin Only)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={fetchAllUsers} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Users'}
            </Button>
            <Button 
              onClick={cleanupDuplicates} 
              variant="destructive"
              disabled={loading}
            >
              Cleanup Duplicates
            </Button>
            <Button 
              onClick={removeAllUsersExceptAdmin} 
              variant="destructive"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove All (Keep Admin Only)
            </Button>
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">All Users ({users.length})</h3>
            {users.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-600">
                    {user.email} • {user.role} • {user.points} points
                  </div>
                  {user.branch && (
                    <div className="text-xs text-gray-500">
                      {user.branch} - {user.semester}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">ID: {user.id.slice(-8)}</span>
                  {user.role !== 'admin' && user.email !== 'siddiqshaik613@gmail.com' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id, user.name)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;