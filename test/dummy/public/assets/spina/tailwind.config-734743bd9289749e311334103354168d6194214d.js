module.exports = {
  content: [
    '/Users/sawhill/Documents/Spina/app/views/**/*.*',
'/Users/sawhill/Documents/Spina/app/components/**/*.*',
'/Users/sawhill/Documents/Spina/app/helpers/**/*.*',
'/Users/sawhill/Documents/Spina/app/javascript/**/*.js',
'/Users/sawhill/Documents/Spina/app/**/application.tailwind.css'
  ],
  theme: {
    fontFamily: {
      body: ['Metropolis'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace']
    },
    extend: {
      colors: {
        spina: {
          light: '#797ab8',
          DEFAULT: '#6865b4',
          dark: '#3a3a70'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
	require('@tailwindcss/aspect-ratio'),
	require('@tailwindcss/typography')
  ]
}
