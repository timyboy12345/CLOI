import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface Photo {
  id: number;
  filename: string;
}

interface AlbumData {
  album: { id: number; name: string };
  photos: Photo[];
}

const PhotoGallery = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:3001/api/albums/${id}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch album photos', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-10">Album not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Albums
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{data.album.name}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <ImageIcon size={16} />
              {data.photos.length} {data.photos.length === 1 ? 'Photo' : 'Photos'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.photos.map(photo => (
          <div 
            key={photo.id} 
            className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group relative shadow-sm hover:shadow-md transition-all duration-300"
          >
            <img 
              src={`http://localhost:3001/uploads/${photo.filename}`} 
              alt="Event" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}
      </div>

      {data.photos.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No photos in this album yet.</p>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
