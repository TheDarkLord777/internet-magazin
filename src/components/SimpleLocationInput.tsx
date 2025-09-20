"use client";
import { useState } from "react";

interface SimpleLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: any) => void;
  placeholder?: string;
  className?: string;
}

export default function SimpleLocationInput({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Location kiriting...",
  className = "",
}: SimpleLocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Toshkent shahri ichidagi joylar
  const commonLocations = [
    // Toshkent tumanlari
    "Chilonzor tumani",
    "Yunusobod tumani", 
    "Mirzo Ulug'bek tumani",
    "Shayxontohur tumani",
    "Olmazor tumani",
    "Bektemir tumani",
    "Mirobod tumani",
    "Sergeli tumani",
    "Uchtepa tumani",
    "Yakkasaroy tumani",
    "Yangihayot tumani",
    
    // Mashhur ko'chalar
    "Navoiy ko'chasi",
    "Amir Temur ko'chasi",
    "Mustaqillik ko'chasi",
    "Buyuk Turon ko'chasi",
    "Fidokor ko'chasi",
    "Bobur ko'chasi",
    "Alisher Navoiy ko'chasi",
    "Rashidov ko'chasi",
    "Farhod ko'chasi",
    "Zarafshon ko'chasi",
    "Chilonzor ko'chasi",
    "Yunusobod ko'chasi",
    "Mirzo Ulug'bek ko'chasi",
    "Shayxontohur ko'chasi",
    "Olmazor ko'chasi",
    "Bektemir ko'chasi",
    "Mirobod ko'chasi",
    "Sergeli ko'chasi",
    "Uchtepa ko'chasi",
    "Yakkasaroy ko'chasi",
    "Yangihayot ko'chasi",
    
    // Mashhur joylar
    "Registon maydoni",
    "Mustaqillik maydoni",
    "Amir Temur maydoni",
    "Navoiy teatri",
    "Oliy Majlis",
    "Toshkent shahar hokimiyati",
    "Toshkent temir yo'l vokzali",
    "Toshkent aeroporti",
    "Chorsu bozori",
    "Minor masjidi",
    "Hazrati Imom majmuasi",
    "Toshkent metropoliteni",
    "Toshkent universiteti",
    "O'zbekiston milliy kutubxonasi",
    "O'zbekiston tarix muzeyi",
    "Toshkent shahar hokimiyati",
    "O'zbekiston Prezidenti qarorgohi",
    "Toshkent shahar hokimiyati",
    "Toshkent shahar hokimiyati",
    "Toshkent shahar hokimiyati"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter common locations
    const filtered = commonLocations.filter(location =>
      location.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSuggestionClick = (location: string) => {
    onChange(location);
    setShowSuggestions(false);
    
    // Get coordinates for Toshkent locations
    const getCoordinates = (locationName: string) => {
      const coordinates: { [key: string]: { lat: number; lng: number } } = {
        // Toshkent tumanlari
        "Chilonzor tumani": { lat: 41.2750, lng: 69.2050 },
        "Yunusobod tumani": { lat: 41.3500, lng: 69.2800 },
        "Mirzo Ulug'bek tumani": { lat: 41.3200, lng: 69.2500 },
        "Shayxontohur tumani": { lat: 41.3100, lng: 69.2300 },
        "Olmazor tumani": { lat: 41.2800, lng: 69.2000 },
        "Bektemir tumani": { lat: 41.2500, lng: 69.1800 },
        "Mirobod tumani": { lat: 41.2900, lng: 69.2200 },
        "Sergeli tumani": { lat: 41.2400, lng: 69.1900 },
        "Uchtepa tumani": { lat: 41.2600, lng: 69.2100 },
        "Yakkasaroy tumani": { lat: 41.3000, lng: 69.2400 },
        "Yangihayot tumani": { lat: 41.2700, lng: 69.2000 },
        
        // Mashhur ko'chalar
        "Navoiy ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Amir Temur ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Mustaqillik ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Buyuk Turon ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Fidokor ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Bobur ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Alisher Navoiy ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Rashidov ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Farhod ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Zarafshon ko'chasi": { lat: 41.2995, lng: 69.2401 },
        "Chilonzor ko'chasi": { lat: 41.2750, lng: 69.2050 },
        "Yunusobod ko'chasi": { lat: 41.3500, lng: 69.2800 },
        "Mirzo Ulug'bek ko'chasi": { lat: 41.3200, lng: 69.2500 },
        "Shayxontohur ko'chasi": { lat: 41.3100, lng: 69.2300 },
        "Olmazor ko'chasi": { lat: 41.2800, lng: 69.2000 },
        "Bektemir ko'chasi": { lat: 41.2500, lng: 69.1800 },
        "Mirobod ko'chasi": { lat: 41.2900, lng: 69.2200 },
        "Sergeli ko'chasi": { lat: 41.2400, lng: 69.1900 },
        "Uchtepa ko'chasi": { lat: 41.2600, lng: 69.2100 },
        "Yakkasaroy ko'chasi": { lat: 41.3000, lng: 69.2400 },
        "Yangihayot ko'chasi": { lat: 41.2700, lng: 69.2000 },
        
        // Mashhur joylar
        "Registon maydoni": { lat: 41.2995, lng: 69.2401 },
        "Mustaqillik maydoni": { lat: 41.2995, lng: 69.2401 },
        "Amir Temur maydoni": { lat: 41.2995, lng: 69.2401 },
        "Navoiy teatri": { lat: 41.2995, lng: 69.2401 },
        "Oliy Majlis": { lat: 41.2995, lng: 69.2401 },
        "Toshkent shahar hokimiyati": { lat: 41.2995, lng: 69.2401 },
        "Toshkent temir yo'l vokzali": { lat: 41.2995, lng: 69.2401 },
        "Toshkent aeroporti": { lat: 41.2995, lng: 69.2401 },
        "Chorsu bozori": { lat: 41.2995, lng: 69.2401 },
        "Minor masjidi": { lat: 41.2995, lng: 69.2401 },
        "Hazrati Imom majmuasi": { lat: 41.2995, lng: 69.2401 },
        "Toshkent metropoliteni": { lat: 41.2995, lng: 69.2401 },
        "Toshkent universiteti": { lat: 41.2995, lng: 69.2401 },
        "O'zbekiston milliy kutubxonasi": { lat: 41.2995, lng: 69.2401 },
        "O'zbekiston tarix muzeyi": { lat: 41.2995, lng: 69.2401 },
        "O'zbekiston Prezidenti qarorgohi": { lat: 41.2995, lng: 69.2401 }
      };
      
      return coordinates[locationName] || { lat: 41.2995, lng: 69.2401 }; // Default to Toshkent center
    };
    
    const coords = getCoordinates(location);
    
    // Create location data
    const locationData = {
      place_id: `simple_${Date.now()}`,
      formatted_address: location,
      name: location,
      geometry: {
        location: coords
      }
    };
    onLocationSelect(locationData);
  };

  const handleBlur = () => {
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
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ${className}`}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {suggestion}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
