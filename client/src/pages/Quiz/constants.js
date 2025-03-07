export const LOTTIE_ANIMATIONS = {
  SPACE_BG: () => import('../../assets/quiz/space-background.json'),
  ROCKET: () => import('../../assets/quiz/rocket-launch.json'),
  ROBOT: () => import('../../assets/quiz/robot-thinking.json'),
  CELEBRATION: () => import('../../assets/quiz/celebration.json'),
  SAD_ROBOT: () => import('../../assets/quiz/sad-robot.json'),
  VS_ANIMATION: () => import('../../assets/quiz/versus.json'),
  SEARCHING: () => import('../../assets/quiz/searching.json'),
  COUNTDOWN: () => import('../../assets/quiz/countdown.json')
};

  
  export const OPPONENTS = [
    { name: 'RoboWhiz', avatar: '🤖', rating: 1200, personality: 'Analytical' },
    { name: 'TechNinja', avatar: '🥷', rating: 1350, personality: 'Strategic' },
    { name: 'DataMaster', avatar: '👨‍💻', rating: 1150, personality: 'Methodical' },
    { name: 'CodeWizard', avatar: '🧙‍♂️', rating: 1400, personality: 'Creative' }
  ];
  
  export const DIFFICULTY_WEIGHTS = {
    Easy: { timeBonus: 5, scoreMultiplier: 1 },
    Medium: { timeBonus: 7, scoreMultiplier: 1.5 },
    Hard: { timeBonus: 10, scoreMultiplier: 2 }
  };
  
  export const GAME_SETTINGS = {
    QUESTION_TIME_LIMIT: 15,
    MIN_CORRECT_TO_PASS: 70,
    TOTAL_QUESTIONS: 10,
    OPPONENT_SEARCH_TIME: 3000,
  };