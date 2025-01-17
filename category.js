import fs from 'fs'
import { Browser } from './browser/core.js'

// Здесь можно добавить regex на ссылки
// И сделать user-friendly вывод
if(!process.argv[2]) throw Error('Category empty')

const link = String(process.argv[2]);

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

	//Setup data
	const apiUrl = link.match(/(\/catalog\/\d+\/[^\/\?]+)/)[1];
	const idCatogory = link.match(/\/catalog\/(\d+)/)[1];
	const apiCategory = `https://www.vprok.ru/web/api/v1/catalog/category/${idCatogory}?sort=popularity_desc&limit=30&page=1`;

	const bodyRequest = {
		noRedirect: true,
		url: apiUrl
	}

	//Get products
	await browser.request(apiCategory, 'POST', JSON.stringify(bodyRequest)).then((list) => {
		const products = list.products.map((product) => {
			return {
				name: product.name,
				image: product.images[0].url.replace('<SIZE>', 'x700'),
				rating: product.rating,
				reviews: product.reviews,
				price: product.price,
				discountPrice: product.discount !== 0 ? product.price : 0,
				oldPrice: product.oldPrice,
				discountSize: product.discount
			}
		})

		let productData = '';

		products.forEach(product => {
				productData += `Название товара: ${product.name}\n`;
				productData += `Ссылка на изображение: ${product.image}\n`;
				productData += `Рейтинг: ${product.rating}\n`;
				productData += `Количество отзывов: ${product.reviews}\n`;
				productData += `Цена: ${product.price}\n`;
				productData += `Акционная цена: ${product.discountPrice}\n`;
				productData += `Цена до акции: ${product.oldPrice}\n`;
				productData += `Размер скидки: ${product.discountSize}\n`;
				productData += `----------------------\n\n`;
		});

		fs.writeFile('products-api.txt', productData, (err) => {
				if (err) throw err;
				console.log('Product data has been successfully saved to: products-api.txt');
		});
	})

	await browser.close()
}