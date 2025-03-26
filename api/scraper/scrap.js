const axios = require('axios');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

async function scraperAmazon() {
    try {
        const { data } = await axios.get('https://www.amazon.com.br/bestsellers/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        const products = [];
        $('div.p13n-sc-uncoverable-faceout').slice(0, 3).each((i, elem) => {
            const name = $(elem).find('.p13n-sc-truncate-desktop-type2').text().trim();
            const price = $(elem).find('._cDEzb_p13n-sc-price_3mJ9Z').text().trim();
            const link = 'https://www.amazon.com.br' + $(elem).find('a').attr('href');

            products.push({ 
                id: `prod_${i+1}_${Date.now()}`,
                rank: i + 1, 
                name, 
                price: price || 'N/A', 
                link,
                scrapedAt: new Date().toISOString(),
                category: 'general',
                source: 'amazon-br'
            });
        });

        return products;
    } catch (error) {
        console.error("Erro", error.message);
        throw error;
    }
}

async function saveProductsToDynamoDB(products) {
    try {
        const putRequests = products.map(product => ({
            PutRequest: {
                Item: product
            }
        }));
        
        const params = {
            RequestItems: {
                [TABLE_NAME]: putRequests
            }
        };

        await dynamoDb.batchWrite(params).promise();
        console.log(`${products.length} produtos salvos no DynamoDB com sucesso`);
    } catch (error) {
        console.error("Erro ao salvar no DynamoDB", error);
        throw error;
    }
}

exports.handler = async (event) => {
    try {
        const products = await scraperAmazon();
        
        await saveProductsToDynamoDB(products);
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Scraping realizado com sucesso",
                productsCount: products.length,
                products
            })
        };
    } catch (error) {
        console.error("Erro na execução da Lambda", error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: "Falha ao executar o scraping",
                details: error.message 
            })
        };
    }
};