/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			// Liquid Morphism Color System
			colors: {
				// Primary neon accents
				primary: {
					500: '#00F0FF',
					400: '#33F3FF',
					300: '#66F6FF',
					200: '#99F9FF',
					100: '#CCFCFF',
					600: '#00CCDD',
					700: '#00A8BB',
					800: '#008499',
					900: '#006077',
					DEFAULT: '#00F0FF',
				},
				// Secondary magenta accent
				secondary: {
					500: '#FF0099',
					400: '#FF33AA',
					300: '#FF66BB',
					200: '#FF99CC',
					100: '#FFCCDD',
					600: '#DD007F',
					700: '#B80066',
					800: '#93004C',
					900: '#6E0033',
					DEFAULT: '#FF0099',
				},
				// Background and surface colors
				bg: {
					depth: '#050510',
					primary: '#0A0A15',
					secondary: '#0F0F1A',
				},
				// Glass surfaces
				surface: {
					glass: 'rgba(20, 20, 25, 0.6)',
					'glass-hover': 'rgba(30, 30, 35, 0.7)',
					overlay: 'rgba(0, 0, 0, 0.4)',
					glassLight: 'rgba(255, 255, 255, 0.05)',
					glassSelected: 'rgba(0, 240, 255, 0.1)',
				},
				// Border colors
				border: {
					glass: 'rgba(255, 255, 255, 0.1)',
					highlight: 'rgba(255, 255, 255, 0.2)',
					primary: '#00F0FF',
					secondary: '#FF0099',
				},
				// Text colors
				text: {
					primary: '#FFFFFF',
					secondary: 'rgba(255, 255, 255, 0.6)',
					muted: 'rgba(255, 255, 255, 0.4)',
				},
				// Legacy shadcn compatibility
				background: '#050510',
				foreground: '#FFFFFF',
				input: 'rgba(255, 255, 255, 0.1)',
				ring: '#00F0FF',
				accent: '#FF0099',
				muted: 'rgba(255, 255, 255, 0.1)',
				popover: 'rgba(20, 20, 25, 0.9)',
				card: 'rgba(20, 20, 25, 0.8)',
				destructive: '#FF4444',
			},
			// Typography
			fontFamily: {
				sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			fontSize: {
				xs: '12px',
				sm: '14px',
				base: '16px',
				lg: '20px',
				xl: '24px',
				'2xl': '32px',
				'3xl': '40px',
				'4xl': '48px',
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			lineHeight: {
				tight: '1.2',
				normal: '1.5',
				relaxed: '1.6',
			},
			// Spacing (4pt grid)
			spacing: {
				'1': '4px',
				'2': '8px',
				'3': '12px',
				'4': '16px',
				'6': '24px',
				'8': '32px',
				'12': '48px',
				'16': '64px',
				'20': '80px',
				'24': '96px',
				'32': '128px',
			},
			// Border radius
			borderRadius: {
				sm: '8px',
				md: '16px',
				lg: '24px',
				xl: '32px',
				full: '9999px',
			},
			// Effects
			blur: {
				sm: '8px',
				md: '16px',
				lg: '32px',
				xl: '48px',
			},
			boxShadow: {
				sm: '0 4px 16px rgba(0,0,0,0.2)',
				lg: '0 8px 32px rgba(0,0,0,0.3)',
				inner: 'inset 1px 1px 0 0 rgba(255, 255, 255, 0.2)',
				neon: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
				neonSecondary: '0 0 10px rgba(255, 0, 153, 0.5), 0 0 20px rgba(255, 0, 153, 0.3)',
				glass: '0 8px 32px rgba(0,0,0,0.3)',
			},
			// Animation
			keyframes: {
				// Liquid morphism animations
				'glass-fade': {
					'0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' },
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3)' },
					'50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
				},
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'glass-fade': 'glass-fade 0.3s ease-out',
				'ripple': 'ripple 0.6s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			// Backdrop blur utilities
			backdropBlur: {
				sm: '8px',
				md: '16px',
				lg: '32px',
				xl: '48px',
			},
			// Transition durations
			transitionDuration: {
				'200': '200ms',
				'300': '300ms',
				'500': '500ms',
				'700': '700ms',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
