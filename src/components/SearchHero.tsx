'use client';

import { useState } from 'react';
import { Search, Bed, Ticket, Utensils, Home, Plane, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SearchHero = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const router = useRouter();

  const tabs = [
    { id: 'all', label: 'Search All', icon: <Search size={20} /> },
    { id: 'hotels', label: 'Hotels', icon: <Bed size={20} /> },
    { id: 'things', label: 'Things to Do', icon: <Ticket size={20} /> },
    { id: 'restaurants', label: 'Restaurants', icon: <Utensils size={20} /> },
    { id: 'rentals', label: 'Holiday Rentals', icon: <Home size={20} /> },
    { id: 'flights', label: 'Flights', icon: <Plane size={20} /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let path = '/destinations';
    if (activeTab === 'hotels') path = '/hotels';
    if (activeTab === 'things') path = '/attractions';
    if (activeTab === 'packages') path = '/packages';

    router.push(`${path}?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 bg-white">
      {/* Background decoration - subtle gradient */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-gray-50 to-white -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black mb-12 tracking-tight">
          Where to?
        </h1>

        {/* Search Interface Container */}
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-1 md:gap-4 mb-4 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all whitespace-nowrap font-bold text-sm border-2 ${
                  activeTab === tab.id
                    ? 'border-black bg-black text-white'
                    : 'border-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-2xl shadow-ta hover:shadow-ta-hover border border-gray-100 p-2 md:p-3 transition-all duration-300"
            >
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search size={22} className="text-black shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    activeTab === 'hotels' ? 'Where to stay?' :
                    activeTab === 'things' ? 'What to do?' :
                    activeTab === 'restaurants' ? 'Where to eat?' :
                    'Places to go, things to do...'
                  }
                  className="w-full bg-transparent text-lg font-bold text-black placeholder-gray-400 focus:outline-none py-2"
                />
              </div>
              
              <div className="h-10 w-[1px] bg-gray-200 hidden md:block" />
              
              <div className="hidden md:flex items-center px-6 gap-2 text-gray-500 hover:text-black cursor-pointer transition-colors">
                <MapPin size={20} />
                <span className="text-sm font-bold">Near me</span>
              </div>

              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white font-black px-8 py-3 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHero;
