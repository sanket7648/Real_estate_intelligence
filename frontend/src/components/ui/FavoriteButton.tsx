import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  propertyId: string;
  propertyTitle: string;
  price: number;
  location: string;
  city: string;
  image: string;
  bhk: number;
  sqft: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function FavoriteButton({ 
  propertyId, 
  propertyTitle, 
  price, 
  location, 
  city, 
  image, 
  bhk, 
  sqft,
  size = 'md',
  showLabel = false 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const userEmail = localStorage.getItem('user_email');

  useEffect(() => {
    if (userEmail) {
      checkFavoriteStatus();
    }
  }, [userEmail, propertyId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/favorites/check/${userEmail}/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userEmail) {
      alert('Please login to save favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        const response = await fetch(`${API_BASE_URL}/api/profile/favorites/remove/${userEmail}/${propertyId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        const response = await fetch('${API_BASE_URL}/api/profile/favorites/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            property_id: propertyId,
            property_title: propertyTitle,
            property_price: price,
            property_location: location,
            property_city: city,
            property_image: image,
            property_bhk: bhk,
            property_sqft: sqft
          })
        });
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeMap = {
    sm: { icon: 12, padding: 'p-1.5', bg: 'w-6 h-6' },
    md: { icon: 16, padding: 'p-2', bg: 'w-8 h-8' },
    lg: { icon: 20, padding: 'p-2.5', bg: 'w-10 h-10' }
  };

  const s = sizeMap[size];

  return (
    <button
      onClick={handleFavoriteClick}
      disabled={loading}
      className={`${s.bg} ${s.padding} rounded-full backdrop-blur-sm flex items-center justify-center transition-all flex-shrink-0 ${
        isFavorite 
          ? 'bg-red-500/80 text-white' 
          : 'bg-black/40 text-white hover:text-red-400'
      } disabled:opacity-50`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={s.icon} fill={isFavorite ? 'currentColor' : 'none'} />
      {showLabel && <span className="ml-1 text-xs font-medium">{isFavorite ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
