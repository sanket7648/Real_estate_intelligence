import { MapPin, BedDouble, Bath, Square, Star, ArrowUpRight } from 'lucide-react';
import { Property } from '../../types';
import FavoriteButton from './FavoriteButton';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

const furnishingColors = {
  Furnished: 'bg-emerald-500/15 text-emerald-400',
  'Semi-Furnished': 'bg-amber-500/15 text-amber-400',
  Unfurnished: 'bg-slate-500/15 text-slate-400',
};

export default function PropertyCard({ property, compact, onFavoriteChange }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover border border-white/8 group">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: compact ? '160px' : '200px' }}>
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            property.status === 'For Sale' ? 'bg-sky-500/80 text-white' : 'bg-amber-500/80 text-white'
          }`}>
            {property.status}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${furnishingColors[property.furnishing]}`}>
            {property.furnishing}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            propertyId={property.id}
            propertyTitle={property.title}
            price={property.price}
            location={property.location}
            city={property.city}
            image={property.image}
            bhk={property.bhk}
            sqft={property.sqft}
            size="md"
          />
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="text-xl font-bold text-white font-grotesk">{formatPrice(property.price)}</div>
          <div className="text-xs text-slate-300">₹{Math.round(property.price / property.sqft).toLocaleString()}/sqft</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{property.title}</h3>
          <div className="flex items-center gap-1 text-amber-400 text-xs ml-2 flex-shrink-0">
            <Star size={11} fill="currentColor" />
            {property.rating}
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin size={11} />
          {property.location}, {property.city}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-white/8">
          <span className="flex items-center gap-1">
            <BedDouble size={12} /> {property.bhk} BHK
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Square size={12} /> {property.sqft} sqft
          </span>
          <button className="ml-auto text-sky-400 hover:text-sky-300 transition-colors">
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
