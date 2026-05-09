/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Microsoft Outlook / Fluent UI palette
        ms: {
          blue:       '#0078D4',   // primary Outlook blue
          blueDark:   '#106EBE',   // hover
          blueLight:  '#EFF6FC',   // light bg
          blueMid:    '#DEECF9',   // selected bg
          neutralDark:'#201F1E',   // near black text
          neutral:    '#323130',   // body text
          neutralMid: '#605E5C',   // secondary text
          neutralLight:'#A19F9D',  // placeholder
          bg:         '#F3F2F1',   // page background
          surface:    '#FFFFFF',   // card / panel
          border:     '#E1DFDD',   // dividers
          borderMid:  '#C8C6C4',   // stronger borders
          hover:      '#F3F2F1',   // hover bg
          selected:   '#EFF6FC',   // selected row
          red:        '#D13438',   // danger
          green:      '#107C10',   // success
          orange:     '#CA5010',   // warning
        },
      },
      boxShadow: {
        'ms-sm': '0 1.6px 3.6px rgba(0,0,0,0.132), 0 0.3px 0.9px rgba(0,0,0,0.108)',
        'ms':    '0 3.2px 7.2px rgba(0,0,0,0.132), 0 0.6px 1.8px rgba(0,0,0,0.108)',
        'ms-lg': '0 6.4px 14.4px rgba(0,0,0,0.132), 0 1.2px 3.6px rgba(0,0,0,0.108)',
      },
    },
  },
  plugins: [],
};