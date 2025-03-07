import React, { useState, useEffect } from 'react';
import { Sparkles, Code, Brain, Lightbulb, Rocket, Cpu, Book } from 'lucide-react';

const WelcomeAnimation = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // useEffect(() => {
  //   const handleMouseMove = (e) => {
  //     setMousePosition({
  //       x: (e.clientX / window.innerWidth) * 30,
  //       y: (e.clientY / window.innerHeight) * 30
  //     });
  //   };

  //   window.addEventListener('mousemove', handleMouseMove);
  //   return () => window.removeEventListener('mousemove', handleMouseMove);
  // }, []);

  // Define icons with their direct Tailwind background color classes
  const orbitingIcons = [
    { Icon: Brain, bgColor: 'bg-primary-500' },
    { Icon: Code, bgColor: 'bg-ternary-400' },
    { Icon: Lightbulb, bgColor: 'bg-primary-500' },
    { Icon: Rocket, bgColor: 'bg-ternary-500' },
    { Icon: Cpu, bgColor: 'bg-primary-400' },
    { Icon: Book, bgColor: 'bg-ternary-500' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden" style={{zIndex: "9999"}}>
      {/* Floating background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${15 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          >
            <Sparkles
              size={Math.random() * 16 + 8}
              className="text-secondary-300/20"
              style={{ transform: `rotate(${Math.random() * 360}deg)` }}
            />
          </div>
        ))}
      </div>

      {/* Main content container with parallax effect */}
      <div 
        className="relative h-full flex flex-col items-center justify-center"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Innovation icons circle */}
        <div className="mb-8 relative">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-1 shadow-xl animate-float">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-secondary-200/20 to-secondary-400/20 animate-pulse"/>
              
              {/* Orbiting innovation icons */}
              <div className="absolute w-48 h-48 animate-orbit">
                {orbitingIcons.map((item, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 -mt-5 -ml-5"
                    style={{
                      transform: `rotate(${(i + 1) * (360 / 6)}deg) translateY(-88px)`
                    }}
                  >
                    <div className={`w-10 h-10 ${item.bgColor} rounded-lg shadow-lg 
                                  flex items-center justify-center animate-hover`}>
                      <item.Icon className="text-white" size={20} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Center logo/icon */}
              <div className="z-10 animate-pulse">
                <Cpu size={32} className="text-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome text with animated gradient */}
        <div className="text-center relative z-10 space-y-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-ternary-500 
                         bg-clip-text text-transparent animate-gradient">
            Welcome to Bidyut Innovation
          </h1>
          <p className="text-2xl text-primary-600 animate-fade-in opacity-0" 
             style={{ animationDelay: '0.5s' }}>
            Where Innovation Meets Excellence
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(100px, -50px) rotate(90deg); }
          50% { transform: translate(0, -100px) rotate(180deg); }
          75% { transform: translate(-100px, -50px) rotate(270deg); }
        }

        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-orbit {
          animation: orbit 30s linear infinite;
        }

        .animate-hover {
          animation: hover 3s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 200% auto;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;