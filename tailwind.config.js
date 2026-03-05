/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Identidade Visual BIT System
                'bit-blue': '#000d1a',   // Deep Navy / Azul Institucional
                'bit-yellow': '#FFD700', // Primary Gold / Amarelo Institucional
                'bit-dark': '#00060d',   // Darker shade
            },
            fontFamily: {
                // Garante que a fonte Montserrat seja usada se importada, ou fallback para sans
                sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            }
        },
    },
    plugins: [],
}
