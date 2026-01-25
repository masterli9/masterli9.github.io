module.exports = {
    darkMode: 'class', // Enable class-based dark mode (supports both light/dark themes)
    theme: {
        extend: {
            colors: {
                background: {
                    light: '#fafafa',
                    dark: '#1a1a1a',
                    lightSecondary: '#ffffff',
                    darkSecondary: '#252525',
                },
                text: {
                    light: '#242424',
                    dark: '#e5e5e5',
                    lightSecondary: '#646464',
                    darkSecondary: '#a0a0a0',
                },
                magenta: '#ff00ff',
                gold: '#ffd700',
                glow: {
                    magenta: {
                        light: 'rgba(255, 0, 255, 0.3)',
                        dark: 'rgba(255, 0, 255, 0.5)',
                    },
                    gold: {
                        light: 'rgba(255, 215, 0, 0.3)',
                        dark: 'rgba(255, 215, 0, 0.5)',
                    },
                },
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif'
                ]
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}