import { useState, useEffect } from 'react';
import LiveTV from './LiveTV';
import Library from './Library';
import Fundraisers from './Fundraisers';
import Counseling from './Counseling';
import PromoStream from './promo/PromoStream';
import HomePage from './HomePage';
import CarBattleGame from './gaming/CarBattleGame.tsx';
import { useCategoryStore } from '../stores/categoryStore';

const ContentGrid = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const [activeCategory, setActiveCategory] = useState('home');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renderContent = () => {
    switch (activeCategory) {
      case 'home':
        return <HomePage />;
      case 'promo':
        return <PromoStream />;
      case 'livetv':
        return <LiveTV />;
      case 'library':
        return <Library />;
      case 'fundraisers':
        return <Fundraisers />;
      case 'counseling':
        return <Counseling />;
      case 'gaming':
        return <CarBattleGame />;
      default:
        return <div className="text-center py-12">Coming Soon</div>;
    }
  };

  return (
    <section className="mt-0">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-cyber-blue -translate-y-1">Flicks</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all font-medium shadow-lg ${
                activeCategory === category.id
                  ? 'bg-cyber-blue text-cyber-black border border-white/20 shadow-neon-blue'
                  : 'bg-ui-dark border border-cyber-blue/20 text-cyber-blue/70 hover:bg-ui-light hover:text-cyber-blue hover:shadow-neon-purple'
              }`}
            >
              {/* Display XCE Network instead of promo stream */}
              {category.id === 'promo' ? 'XCE Network' : category.name}
            </button>
          ))}
        </div>
      </div>

      {renderContent()}
    </section>
  );
};

export default ContentGrid;