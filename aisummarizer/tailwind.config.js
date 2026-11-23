  /** @type {import('tailwindcss').Config} */
 export default {
 content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,css}', // ищет классы во всех компонентах
  ],
    theme: {
      extend: {
        fontFamily: {
          satoshi: ["Satoshi", "sans-serif"]
        }
      },
    },
    plugins: [],
  }