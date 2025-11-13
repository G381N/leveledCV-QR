'use client';

import PixelBlast from '@/components/PixelBlast';
import { useState, useEffect } from 'react';

type GameState = 'initial' | 'attempted' | 'second-chance' | 'game-over';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('initial');
  // Track refreshes and state only in localStorage for reliability
  const [winningCard, setWinningCard] = useState<'left' | 'right' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', description: '' });

  useEffect(() => {
    // Use only localStorage for all state (no sessionStorage)
    let savedState = localStorage.getItem('leveledcv-game-state');
    let savedWinningCard = localStorage.getItem('leveledcv-winning-card');
    let refreshCount = parseInt(localStorage.getItem('leveledcv-refresh-count') || '0', 10);
    let secondChanceShown = localStorage.getItem('leveledcv-second-chance-shown') === 'true';

    // If no winning card, assign one
    if (!savedWinningCard) {
      const randomWinner = Math.random() > 0.5 ? 'left' : 'right';
      localStorage.setItem('leveledcv-winning-card', randomWinner);
      savedWinningCard = randomWinner;
    }
    setWinningCard(savedWinningCard as 'left' | 'right');

    // If no state, set to initial
    if (!savedState) {
      localStorage.setItem('leveledcv-game-state', 'initial');
      savedState = 'initial';
    }

    // If user is in attempted state and refreshes 3+ times, give second chance ONCE
    if (savedState === 'attempted' && !secondChanceShown) {
      refreshCount += 1;
      localStorage.setItem('leveledcv-refresh-count', refreshCount.toString());
      if (refreshCount >= 3) {
        setGameState('second-chance');
        localStorage.setItem('leveledcv-game-state', 'second-chance');
        localStorage.setItem('leveledcv-second-chance-shown', 'true');
      } else {
        setGameState('attempted');
      }
    } else {
      setGameState(savedState as GameState);
    }

    setIsLoading(false);
  }, []);

  // Show modal messages when game state changes - but only once per state
  useEffect(() => {
    if (isLoading) return; // Don't show modals during initial load
    
    const lastShownState = localStorage.getItem('leveledcv-last-modal-state');
    
    if (gameState === 'attempted' && lastShownState !== 'attempted') {
      showTemporaryModal(
        'Nice Try. Already Played',
        'You already made your choice. Try refreshing a few times for another chance'
      );
      localStorage.setItem('leveledcv-last-modal-state', 'attempted');
    } else if (gameState === 'second-chance' && lastShownState !== 'second-chance') {
      showTemporaryModal(
        'One Last Chance',
        "You're persistent. Choose wisely this time"
      );
      localStorage.setItem('leveledcv-last-modal-state', 'second-chance');
    } else if (gameState === 'game-over' && lastShownState !== 'game-over') {
      showTemporaryModal(
        'Game Over. You Lost Twice',
        'No more chances available. Visit leveledcv.com directly'
      );
      localStorage.setItem('leveledcv-last-modal-state', 'game-over');
    }
  }, [gameState, isLoading]);

  const showTemporaryModal = (title: string, description: string) => {
    setModalMessage({ title, description });
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  const handleCardClick = (card: 'left' | 'right') => {
    if (gameState === 'game-over') {
      showTemporaryModal(
        'Game Over. You Lost Twice',
        'No more chances available. Visit leveledcv.com directly.'
      );
      return;
    }

    if (gameState === 'attempted') {
      showTemporaryModal(
        'Nice Try. Already Played',
        'You already made your choice. Try refreshing a few times for another chance.'
      );
      return;
    }

    const isWinner = card === winningCard;

    if (isWinner) {
      showTemporaryModal(
        'Success! You Chose Wisely',
        'Redirecting you to your next step...'
      );
      setTimeout(() => {
        window.location.href = 'https://leveledcv.com';
      }, 2500);
    } else {
      showTemporaryModal(
        'Oops, Wrong Choice',
        'That path was not meant for you. Enjoy the music!'
      );
      setTimeout(() => {
        openRickRoll();
      }, 1500);
      // Update game state
      if (gameState === 'initial') {
        setTimeout(() => {
          setGameState('attempted');
          localStorage.setItem('leveledcv-game-state', 'attempted');
          // Start refresh count for second chance
          localStorage.setItem('leveledcv-refresh-count', '1');
        }, 3000);
      } else if (gameState === 'second-chance') {
        setTimeout(() => {
          setGameState('game-over');
          localStorage.setItem('leveledcv-game-state', 'game-over');
        }, 3000);
      }
    }
  };

  const openRickRoll = () => {
    // Open rick roll in fullscreen
    const rickRollWindow = window.open(
      'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1',
      '_blank',
      'fullscreen=yes,width=' + screen.width + ',height=' + screen.height
    );
    
    if (rickRollWindow) {
      rickRollWindow.focus();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const isInteractive = gameState === 'initial' || gameState === 'second-chance';

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Render the PixelBlast full-viewport as background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#a855f7"
          className="w-full h-full"
        />
      </div>


      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl 
                        p-10 sm:p-14 md:p-16 max-w-3xl w-full shadow-2xl shadow-purple-500/10">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {modalMessage.title.split('.').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  
                  if (trimmed.includes('Success') || trimmed.includes('One Last') || trimmed.includes('Tomorrow')) {
                    return (
                      <span key={idx}>
                        {idx > 0 && <br />}
                        <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                          {trimmed}
                        </span>
                      </span>
                    );
                  } else if (trimmed.includes('Wrong') || trimmed.includes('Game Over') || trimmed.includes('Lost')) {
                    return (
                      <span key={idx}>
                        {idx > 0 && <br />}
                        {trimmed.split(' ').map((word, wordIdx) => {
                          if (word.includes('Wrong') || word.includes('Oops') || word.includes('Game') || word.includes('Over') || word.includes('Lost')) {
                            return <span key={wordIdx} className="text-red-400">{word} </span>;
                          }
                          return <span key={wordIdx}>{word} </span>;
                        })}
                      </span>
                    );
                  }
                  return (
                    <span key={idx}>
                      {idx > 0 && <br />}
                      {trimmed}
                    </span>
                  );
                })}
              </h2>
              <div className="space-y-3">
                <p className="text-lg sm:text-xl text-white font-light leading-relaxed">
                  {modalMessage.description.split('.')[0]}.
                </p>
                {modalMessage.description.split('.')[1] && (
                  <p className="text-base sm:text-lg text-gray-400 font-light">
                    {modalMessage.description.split('.')[1].trim()}
                  </p>
                )}

                {/* subtle hint shown in every modal */}
                <p className="text-[10px] sm:text-sm md:text-base text-gray-300 italic mt-3" style={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.95rem)' }}>
                  Hint: our link just might be on the page — check the bottom of the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-12 sm:mb-16 md:mb-20 tracking-tight">
          Try Your Luck
        </h1>

        {/* Cards container - always render but may be disabled */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 px-4">
          {/* If user already attempted and hasn't gotten a second chance, show a persistent banner so page isn't blank */}
          {gameState === 'attempted' && (
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 max-w-3xl w-[90%]">
              <div className="bg-black/60 border border-purple-500/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-white font-semibold">You've already chosen. Refresh a few times to try for one last chance.</p>
              </div>
            </div>
          )}
          {/* Left Card - Purple themed */}
          <button
            onClick={() => handleCardClick('left')}
            onMouseEnter={() => setHoveredCard('left')}
            onMouseLeave={() => setHoveredCard(null)}
            aria-disabled={!isInteractive}
            className={`group relative overflow-hidden rounded-3xl transform transition-all duration-700 ease-out focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${!isInteractive ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02]'}`}
          >
            {/* Glass morphism background */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-purple-950/40 via-purple-900/30 to-black/40 
                          border border-purple-500/20 rounded-3xl overflow-hidden
                          transition-all duration-700">
              
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

              {/* Content */}
              <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 min-h-[160px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[320px] flex flex-col justify-between">
                {/* Top section */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                                bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-xs sm:text-sm text-purple-300 font-medium uppercase tracking-wider">
                      Path One
                    </span>
                  </div>
                </div>

                {/* Center content */}
                <div className="space-y-6 my-8">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-400 tracking-tight leading-tight">
                    Choice 1
                  </h2>
                </div>

                {/* Bottom indicator */}
                <div className="flex items-center gap-3 text-purple-400">
                  <div className={`w-12 h-[2px] bg-gradient-to-r from-purple-500 to-transparent 
                                transition-all duration-700 group-hover:w-24`} />
                  <span className="text-sm font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    Choose →
                  </span>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-6 right-6 w-24 h-24 border-t-2 border-r-2 border-purple-500/20 rounded-tr-3xl
                            group-hover:border-purple-500/40 transition-colors duration-700" />
              <div className="absolute bottom-6 left-6 w-24 h-24 border-b-2 border-l-2 border-purple-500/20 rounded-bl-3xl
                            group-hover:border-purple-500/40 transition-colors duration-700" />
            </div>
          </button>

          {/* Right Card - Cyan themed */}
          <button
            onClick={() => handleCardClick('right')}
            onMouseEnter={() => setHoveredCard('right')}
            onMouseLeave={() => setHoveredCard(null)}
            aria-disabled={!isInteractive}
            className={`group relative overflow-hidden rounded-3xl transform transition-all duration-700 ease-out focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${!isInteractive ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02]'}`}
          >
            {/* Glass morphism background */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-cyan-950/40 via-blue-900/30 to-black/40 
                          border border-cyan-500/20 rounded-3xl overflow-hidden
                          transition-all duration-700">
              
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-500/10 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              {/* Content */}
              <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 min-h-[160px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[320px] flex flex-col justify-between">
                {/* Top section */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                                bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse animation-delay-200" />
                    <span className="text-xs sm:text-sm text-cyan-300 font-medium uppercase tracking-wider">
                      Path Two
                    </span>
                  </div>
                </div>

                {/* Center content */}
                <div className="space-y-6 my-8">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-400 tracking-tight leading-tight">
                    Choice 2
                  </h2>
                </div>

                {/* Bottom indicator */}
                <div className="flex items-center gap-3 text-cyan-400">
                  <div className={`w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent 
                                transition-all duration-700 group-hover:w-24`} />
                  <span className="text-sm font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    Choose →
                  </span>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-6 right-6 w-24 h-24 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-3xl
                            group-hover:border-cyan-500/40 transition-colors duration-700" />
              <div className="absolute bottom-6 left-6 w-24 h-24 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-3xl
                            group-hover:border-cyan-500/40 transition-colors duration-700" />
            </div>
          </button>
        </div>

        {/* Tiny subtle link to LeveledCV (barely visible) */}
        <div className="absolute bottom-6 right-6 z-40">
          <a
            href="https://leveledcv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] opacity-20 hover:opacity-60 text-white underline"
            title="Open leveledcv.com"
          >
            leveledcv.com
          </a>
        </div>
      </div>
    </div>
  );
}
