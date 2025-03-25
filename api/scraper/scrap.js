const axios = require('axios');
const cheerio = require('cheerio');

async function scraperAmazon() {
    try {
        const { data } = await axios.get('https://www.amazon.com.br/bestsellers');
        const $ = cheerio.load(data);

        const products = [];
        $('div.p13n-sc-uncoverable-faceout').slice(0, 3).each((i, elem) => {
            const name = $(elem).find('.p13n-sc-truncate-desktop-type2').text().trim();
            const price = $(elem).find('._cDEzb_p13n-sc-price_3mJ9Z').text().trim();
            const link = 'https://www.amazon.com.br/bestsellers' + $(elem).find('a').attr('href');

            products.push({ rank: i + 1, name, price, link });
        });

        if (products.length === 0) {
            console.log("Nenhum produto encontrado.");
        } else {
            products.forEach((product) => {
                console.log(`\n#${product.rank}`);
                console.log(`Nome: ${product.name}`);
                console.log(`Preço: ${product.price || 'N/A'}`);
                console.log(`Link: ${product.link}`);
            });
        }

    } catch (error) {
        console.error("Erro", error.message);
    }
}

scraperAmazon().then((data) => console.log("Dados:", data));