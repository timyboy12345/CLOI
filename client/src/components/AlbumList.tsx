import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ChevronRight } from 'lucide-react';

interface Album {
  id: number;
  name: string;
  date: string;
}

const AlbumList = () => {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/albums')
      .then(res => setAlbums(res.data))
      .catch(err => console.error('Failed to fetch albums', err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Event Albums</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {albums.length} Albums
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(album => (
          <Link 
            to={`/album/${album.id}`} 
            key={album.id} 
            className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar size={20} />
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {album.name}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(album.date).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </Link>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No albums found. Start by uploading some photos in the Admin panel.</p>
        </div>
      )}
    </div>
  );
};

export default AlbumList;
