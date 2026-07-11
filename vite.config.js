import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
	plugins: [uni()],
	server: {
		proxy: {
			'/api/v1': {
				target: 'https://consumer.siamfeast.com',
				changeOrigin: true,
				secure: true
			},
			// MinIO 图片代理（如果本地测试图片加载失败可以加这个）
			'/sf-uploads': {
				target: 'https://minio.siamfeast.com',
				changeOrigin: true,
				secure: true
			}
		}
	}
})
