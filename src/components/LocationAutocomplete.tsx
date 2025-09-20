"use client";
import { useState, useEffect, useRef } from "react";

interface LocationData {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Location qidiring...",
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          // Try new API first, fallback to legacy
          if (window.google.maps.places.AutocompleteSuggestion) {
            autocompleteService.current = new window.google.maps.places.AutocompleteSuggestion();
          } else if (window.google.maps.places.AutocompleteService) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
          }
        } catch (error) {
          console.warn('Google Places API not available:', error);
        }
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) return;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          // Try new API first, fallback to legacy
          if (window.google.maps.places.AutocompleteSuggestion) {
            autocompleteService.current = new window.google.maps.places.AutocompleteSuggestion();
          } else if (window.google.maps.places.AutocompleteService) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
          }
        } catch (error) {
          console.warn('Google Places API initialization failed:', error);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteService.current) return;

    setIsLoading(true);
    
    // Try new API first, fallback to legacy
    if (autocompleteService.current.getPlacePredictions) {
      // Legacy API (callback-based)
      autocompleteService.current.getPlacePredictions(
        {
          input: inputValue,
          types: ['geocode', 'establishment', 'street_address', 'route', 'premise'],
          componentRestrictions: { country: 'uz' }, // Uzbekistan uchun
        },
        (predictions: any[], status: any) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.map(prediction => ({
              place_id: prediction.place_id,
              formatted_address: prediction.description,
              name: prediction.structured_formatting.main_text,
              geometry: { location: { lat: 0, lng: 0 } } // Will be filled when selected
            })));
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else if (autocompleteService.current.getPlacePredictions) {
      // New API (promise-based)
      autocompleteService.current.getPlacePredictions(
        {
          input: inputValue,
          types: ['geocode', 'establishment', 'street_address', 'route', 'premise'],
          componentRestrictions: { country: 'uz' }, // Uzbekistan uchun
        }
      ).then((predictions: any[]) => {
        setIsLoading(false);
        if (predictions && predictions.length > 0) {
          setSuggestions(predictions.map(prediction => ({
            place_id: prediction.place_id,
            formatted_address: prediction.description,
            name: prediction.structured_formatting.main_text,
            geometry: { location: { lat: 0, lng: 0 } } // Will be filled when selected
          })));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }).catch((error: any) => {
        console.warn('AutocompleteSuggestion failed:', error);
        setIsLoading(false);
        setSuggestions([]);
        setShowSuggestions(false);
      });
    } else {
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationData) => {
    onChange(suggestion.formatted_address);
    setShowSuggestions(false);
    
    // Try new Place API first, fallback to legacy PlacesService
    if (window.google?.maps?.places?.Place) {
      const place = new window.google.maps.places.Place({
        id: suggestion.place_id,
        requestedLanguage: 'uz'
      });
      
      place.fetchFields({
        fields: ['id', 'displayName', 'formattedAddress', 'location']
      }).then((placeData: any) => {
        const locationData: LocationData = {
          place_id: placeData.id,
          formatted_address: placeData.formattedAddress,
          name: placeData.displayName,
          geometry: {
            location: {
              lat: placeData.location?.lat || 0,
              lng: placeData.location?.lng || 0
            }
          }
        };
        onLocationSelect(locationData);
      }).catch((error: any) => {
        console.warn('Place API failed:', error);
        // Fallback: use suggestion data without coordinates
        const locationData: LocationData = {
          place_id: suggestion.place_id,
          formatted_address: suggestion.formatted_address,
          name: suggestion.name,
          geometry: {
            location: {
              lat: 0,
              lng: 0
            }
          }
        };
        onLocationSelect(locationData);
      });
    } else if (window.google?.maps?.places?.PlacesService) {
      // Legacy PlacesService
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      placesService.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['place_id', 'formatted_address', 'name', 'geometry']
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const locationData: LocationData = {
              place_id: place.place_id,
              formatted_address: place.formatted_address,
              name: place.name || place.formatted_address,
              geometry: {
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              }
            };
            onLocationSelect(locationData);
          } else {
            // Fallback: use suggestion data without coordinates
            const locationData: LocationData = {
              place_id: suggestion.place_id,
              formatted_address: suggestion.formatted_address,
              name: suggestion.name,
              geometry: {
                location: {
                  lat: 0,
                  lng: 0
                }
              }
            };
            onLocationSelect(locationData);
          }
        }
      );
    } else {
      // Fallback: use suggestion data without coordinates
      const locationData: LocationData = {
        place_id: suggestion.place_id,
        formatted_address: suggestion.formatted_address,
        name: suggestion.name,
        geometry: {
          location: {
            lat: 0,
            lng: 0
          }
        }
      };
      onLocationSelect(locationData);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ${className}`}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {suggestion.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {suggestion.formatted_address}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
