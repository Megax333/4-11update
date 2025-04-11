import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchDropdown from './SearchDropdown';
import { useSearch } from '../../hooks/useSearch';

const SearchBar = () => {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { query, setQuery } = useSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative z-50">
      <div className="relative transition-all duration-300 w-[520px]">
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-70 rounded-[28px] blur-[1px]"></div>
          <div 
            className={`relative transition-all duration-300 ${
              isFocused 
                ? 'bg-[#1E1E2A] rounded-t-[28px] border-0' 
                : 'bg-[#1E1E2A] rounded-[28px] border-0'
            }`}
          >
          <div className="flex items-center px-5 py-3">
            <div className={`relative w-5 h-5 mr-3 transition-all duration-500 ${isFocused ? 'text-purple-500' : 'text-gray-400'} group`}>
              <div className={`absolute inset-0 rounded-full border-2 border-current transition-all duration-300 ${isFocused ? 'animate-[spin_3s_linear_infinite]' : ''}`} style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
              <div className={`absolute inset-0 rounded-full border-2 border-current transition-all duration-300 ${isFocused ? 'animate-[spin_2s_linear_infinite_reverse]' : ''}`} style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }} />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search content, creators, and more..."
              className="w-full bg-transparent text-gray-300 focus:outline-none placeholder:text-gray-500 text-[15px] font-light tracking-wide"
            />
          </div>
          </div>
        </div>

        {isFocused && <SearchDropdown />}
      </div>
    </div>
  );
};

export default SearchBar;