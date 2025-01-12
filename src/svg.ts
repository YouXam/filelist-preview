import satori from 'satori'
import { template } from './template'
import { Context } from 'hono'
import { ImageBodyType } from '.'

let fontsCache: Record<string, ArrayBuffer> | null = null

async function loadFonts(c: Context) {
    if (fontsCache) return fontsCache
    const fonts: Record<string, ArrayBuffer> = {}
	const [
		extraLight,
		bold
	] = await Promise.all([
		c.env.ASSETS.fetch("https://static.local/fonts/NotoSansSC-ExtraLight.ttf"),
		c.env.ASSETS.fetch("https://static.local/fonts/NotoSansSC-Bold.ttf"),
	])
	const [
		extraLightFont,
		boldFont
	] = await Promise.all([
		extraLight.arrayBuffer(),
		bold.arrayBuffer(),
	])
	fonts.extraLight = extraLightFont
	fonts.bold = boldFont
    fontsCache = fonts
    return fonts
}


export async function svg<T extends Context<any, any, ImageBodyType>>(c: T) {
	const fonts = await loadFonts(c)
    const data = c.req.valid('json')
    const fontSize = data.fontSize ?? 22
    const height = data.height ?? 800
    const width = data.width ?? 600
	return await satori(
		await template(c, data.files, fontSize, data.title, height),
		{
			width,
			height,
			fonts: [
				{
					name: 'Noto',
					data: fonts.extraLight,
					weight: 100,
					style: 'normal',
				},
				{
					name: 'Noto',
					weight: 400,
					data: fonts.bold,
					style: 'normal'
				}
			],
		},
	)
}
