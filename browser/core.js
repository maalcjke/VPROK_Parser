import puppeteer from 'puppeteer'

export class Browser {
	constructor(identifyElement, launchOptions = []) {
		this.identifyElement = identifyElement
		this.launchOptions = launchOptions
	}

	async launch() {
		if(this.browser) return;
		this.browser = await puppeteer.launch(this.launchOptions);
	}

	async close() {
		this.browser.close();
	}

	async newPage() {
		return await this.browser.newPage()
	}

	async reload() {
		return await this.page.reload()
	}

	isXPath(selector) {
    return selector.startsWith('//') || selector.startsWith('xpath=');
  }

	async getElement(selector) {
		const options = { timeout: 2500 }

		try {
			if (this.isXPath(selector)) {
				const cleanSelector = selector.replace('xpath=', '');
				return await this.page.waitForSelector(`xpath/${cleanSelector}`, options)
			} else {
				return await this.page.waitForSelector(selector, options);
			}
		} catch(error) {
			console.log(`[SKIP] Element: ${selector} skipped, reason: ${error.message}`)
		}
	}

	async click(selector) {
		const element = await this.getElement(selector)
		await element.click()
	}

	async getText(selector, cb = null) {
		const element = await this.getElement(selector)

		if(!element) return null

		const textProperty = await element.getProperty('textContent');
		let text = await textProperty.jsonValue();

		if(cb) text = cb(text)

		return await text
	}

	async remove(selector) {		
		const element = await this.getElement(selector)
		element.remove()
	}

	async goto(address, blank = true) {
		if(!address) return;
		
		this.page = blank
				? await this.newPage()
				: this.page ?? await this.newPage();

		await this.page.goto(address);
		await this.page.waitForSelector(this.identifyElement);
		await this.page.waitForNavigation({ 
				waitUntil: 'domcontentloaded'
		});
	}

	async request(url, method, body = '', needJson = true) {
		const requestBody = { method }
		if(method !== 'GET') requestBody.body = body

		return await this.page.evaluate((url, requestBody, needJson) => {
			return fetch(url, requestBody).then(res => {
				if(needJson) return res.json()
				return '';
			})
		}, url, requestBody, needJson)
	}

	async makeScreenshot() {
		await this.page.screenshot({
			path: 'screenshot.jpg',
			fullPage: true
		})
	}
}