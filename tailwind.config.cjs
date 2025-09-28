/**** Tailwind used lightly to help with spacing/typography; Kendo handles components ****/
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: 'rgba(255,255,255,0.08)'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: [],
};
