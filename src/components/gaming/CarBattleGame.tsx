import React from 'react';

const CarBattleGame = () => {
  const gameUrl = '/games/carbattle/game.html'; // Path relative to the public folder

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#1a1a2e]">
      <h2 className="text-2xl font-bold mb-4 text-white">Car Battle</h2>
      <iframe
        src={gameUrl}
        title="Car Battle Game"
        style={{ width: '90vw', height: '80vh', border: 'none', borderRadius: '8px' }}
      />
      <p className="text-sm text-gray-400 mt-3">
        Click inside the game area to enable controls (Gamepad recommended).
      </p>
    </div>
  );
};

export default CarBattleGame;
