// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 💡 Docusaurus의 다크 모드와 연동하기 위한 설정입니다.
  darkMode: ["class", '[data-theme="dark"]'], 
  
  // 💡 가장 중요한 부분! src 폴더와 docs 폴더를 모두 포함해야 합니다.
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}', 
  ],
  theme: {
    // ... shadcn/ui 테마 설정
    container: {
      // ...
    },
    extend: {
      // ...
    },
  },
  plugins: [require("tailwindcss-animate")],
}