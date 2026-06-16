import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogIn, LogOut, Plus, Upload, FolderPlus, User as UserIcon, Loader2 } from 'lucide-react';

interface User {
  email?: string;
  name?: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [albumName, setAlbumName] = useState('');
  const [albums, setAlbums] = useState<{ id: number; name: string }[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchAlbums();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/auth/me', { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/albums');
      setAlbums(res.data);
      if (res.data.length > 0 && !selectedAlbum) setSelectedAlbum(res.data[0].id.toString());
    } catch (err) {
      console.error('Failed to fetch albums', err);
    }
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/login';
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/logout', {}, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/albums', { name: albumName }, { withCredentials: true });
      setAlbumName('');
      fetchAlbums();
      alert('Album created successfully!');
    } catch (err) {
      alert('Failed to create album. Please ensure you are logged in.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || !selectedAlbum) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      await axios.post(`http://localhost:3001/api/albums/${selectedAlbum}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Photos uploaded successfully!');
      setFiles(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      alert('Upload failed. Please ensure you are logged in.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-8">Please log in to manage your albums and upload new photos.</p>
          <button 
            onClick={handleLogin} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <LogIn size={20} />
            Login via OIDC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
            {(user.name || user.email || 'A')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome, {user.name || user.email || 'Admin'}!</h1>
            <p className="text-sm text-gray-500">Managing Photo Library</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Album Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <FolderPlus size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create New Album</h2>
          </div>
          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Album Name</label>
              <input 
                type="text" 
                placeholder="e.g. Summer Vacation 2026" 
                value={albumName} 
                onChange={(e) => setAlbumName(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Plus size={20} />
              Create Album
            </button>
          </form>
        </section>

        {/* Upload Photos Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Upload size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Upload Photos</h2>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Album</label>
              <select 
                value={selectedAlbum} 
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                {albums.length === 0 && <option disabled>No albums available</option>}
                {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Photos</label>
              <input 
                type="file" 
                multiple 
                onChange={(e) => setFiles(e.target.files)} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              disabled={uploading || albums.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Photos
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
