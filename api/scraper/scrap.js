import puppeteer from "puppeteer";

async function scraperAmazon() {
    const url = "https://www.amazon.com.br/bestsellers/";

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2" });
    const productSelector = ".p13n-sc-truncate-desktop-type2";
    await page.waitForSelector(productSelector, { timeout: 20000 });

    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".zg-item")).slice(0, 3).map((el) => {
                const titleElement = el.querySelector(".p13n-sc-truncate-desktop-type2");
                const priceElement = el.querySelector("._cDEzb_p13n-sc-price_3mJ9Z");
                const linkElement = el.querySelector("a.a-link-normal");

                return {
                    title: titleElement ? titleElement.innerText.trim() : "Sem título",
                    price: priceElement ? priceElement.innerText.trim() : "Sem preço",
                    link: linkElement ? "https://www.amazon.com.br" + linkElement.getAttribute("href") : "#"
                };
            });
    });

    if (products.length === 0) {
        console.error("Nenhum produto encontrado.");
    } else {
        console.log("3 produtos mais vendidos:", products);
    }

    await browser.close();
    return products;
}

scraperAmazon().then((data) => console.log("Dados:", data));