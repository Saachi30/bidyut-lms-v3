module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFE4CA',
          200: '#FFD1A7',
          300: '#FFBE84',
          400: '#FF9A43',
          500: '#FF8514', // Main orange from image
          600: '#ED7200',
        },
        secondary: {
          50: '#E5FFFC',
          100: '#B8FFF9',
          200: '#8AFFF6',
          300: '#5CFFF3',
          400: '#2EFFF0',
          500: '#00FFE4', // Main cyan from image
          600: '#00CCB6',
        },
        ternary: {
          100: '#b3e5fc', // Light blue
          300: '#4fc3f7', // Softer blue
          400: '#29b6f6', // Brighter blue
          500: '#0288d1', // Original color
          600: '#0277bd', // Slightly darker blue
          800: '#003c8f', // Deep blue
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'serif'], // Heading font
        subheading: ['Nunito Sans', 'serif'], // Subheading font
        text: ['Roboto', 'serif'], // Body text font
      },
      keyframes: {
       
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite', // ✅ Fixed comma
       
      },
    },
  },
  plugins: [],
};
