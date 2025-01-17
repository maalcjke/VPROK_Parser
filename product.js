import fs from 'fs'
import { Browser } from './browser/core.js'

// Здесь можно добавить regex на ссылки
// И сделать user-friendly вывод
if(!process.argv[2]) throw Error('Link empty')
if(!process.argv[3]) throw Error('region empty')

const link = String(process.argv[2]);
const region = String(process.argv[3]);

//Отличительная особенность основного сайта от protected page
const identifyElement = `xpath///div[contains(@class, 'UiHeaderHorizontalBase_logo')]`

const browser = new Browser(identifyElement, {
	dumpio: true,
	headless: true,
	defaultViewport: {
		width: 1200,
		height: 800
  },
	args: ["--disable-notifications"]
})

run()

async function run() {
	await browser.launch();
	await browser.goto(link);

	//Check region
	await browser.request('https://www.vprok.ru/web/api/v1/regionList', 'GET').then((regions) => {
		if(!regions.regionList || !Array.isArray(regions.regionList)) throw Error('Error loading regions')
		
		const exist = regions.regionList.some(regionObject => regionObject.name === region)
		if(!exist) throw Error('Region not found')
	})

	//Bypass valid click
	await browser.page.$eval('#screenPortal', el => el.remove());
	await browser.makeScreenshot()
	
	//Change region
	await browser.click(`[class^="Region_region"]`)
	await browser.click(`//li[contains(@class, 'UiRegionListBase_item') and text()='${region}']`)
	
	//Compile data
	const product = {
		price: await browser.getText(`//div[contains(@class, 'PriceInfo_root')] //span[contains(@class, 'Price_role_discount') or contains(@class, 'Price_role_regular')]/text()`),
		priceOld: (await browser.getText(`//div[contains(@class, 'PriceInfo_root')] //span[contains(@class, 'Price_role_old')]/text()`)) ?? 0,
		rating: await browser.getText('[class^="ActionsRow_stars"]', el => Number.parseFloat(el)),
		reviewCount: (await browser.getText('a[class^="ActionsRow_reviews"]', el => Number.parseInt(el)))
	}

	//Format
	const productString = 
	`price=${product.price}\npriceOld=${product.priceOld}\nrating=${product.rating}\nreviewCount=${product.reviewCount}`

	//Write on disk
	fs.writeFile('product.txt', productString, (err) => {
			if (err) console.error('Error saving file:', err)
			else console.log('File saved successfully!');
	});

	//Close app
	await browser.close()
}