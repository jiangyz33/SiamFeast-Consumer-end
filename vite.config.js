import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
	plugins: [uni()],
	server: {
		proxy: {
			'/api/v1': {
				target: 'http://106.13.161.35:8082',
				changeOrigin: true
			}
		}
	}
})
