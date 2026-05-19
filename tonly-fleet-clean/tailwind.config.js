/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    'bg-blue-500/20','text-blue-400','bg-green-500/20','text-green-400',
    'bg-red-500/20','text-red-400','bg-amber-500/20','text-amber-400',
    'bg-orange-500/20','text-orange-400','bg-slate-500/20','text-slate-400',
    'bg-purple-500/20','text-purple-400','bg-blue-500/10','border-blue-500/20',
    'bg-green-500/10','border-green-500/20','bg-red-500/10','border-red-500/20',
    'bg-amber-500/10','border-amber-500/20','bg-purple-500/10','border-purple-500/20',
  ],
}
