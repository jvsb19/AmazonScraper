### Web scraping localmente:
Optei por utilizar a biblioteca Axios para realizar uma requisição da página de mais vendidos da Amazon Brasil e também o Cheerio para extrair as informações HTML dos três produtos mais vendidos listados. O código coleta o nome, preço e link de cada item armazenado num array. Tendo a tratativa de erros caso não sejam encontrados itens.

### Web scraping no AWS:
O código realiza uma função Lambda na AWS que ao efetuar o web scraping dos mais vendidos da Amazon, é armazenado os dados no DynamoDB. Como o código acima ele utiliza a biblioteca Axios para requisições HTTP, Cheerio para a manipulação do HTML e adicionando a biblioteca aws-sdk para a aplicação interagir com o DynamoDB. A função scraperAmazon faz uma requisição GET para a URL dos mais vendidos da Amazon, incluindo um cabeçalho User-Agent para evitar bloqueios, em seguida utilizo o Cheerio para extrair os três primeiros produtos listados. Cada produto coletado recebe um único “id”, sua posição no ranking, nome, preço e link. Após isso os dados são formatados e inseridos no DynamoDB utilizando um PutRequest para cada item. Por fim a função handler realiza todo esse processo chamando a função scraperAmazon, que ao armazenar os dados extraídos responderá um HTTP 200 e um JSON contendo as informações dos dados capturados. Caso falhe a extração retornará um HTTP 500 com uma mensagem detalhada sobre o erro.

### Criação da tabela no DynamoDB:
Criei uma tabela no DynamoDB com o nome de ProductsBestSellers no qual a chave primária é o atributo “id” do tipo string. O valor armazenado nesse atributo é gerado dinamicamente que se resume na concatenação do ranking do produto no momento que foi tirado e do timestamp registrado pela função Date.now() do Node.js, garantindo um identificador único para cada item inserido. Dessa forma, permitindo consultas eficientes sem colisões de chave ao armazenar extrações que possam ter os mesmos nomes, preço etc.

![Image](https://github.com/user-attachments/assets/20b0a652-cedb-4da0-85ea-9fed26dabb1b)

### Criação da API:
Foi utilizada uma API do tipo HTTP, já que foi utilizado a biblioteca Axios que realiza requisições HTTP para acessar e extrair dados da Amazon. Em seguida, criei a Resource “Scrap”, permitindo que a API gerencie requisições. Durante essa configuração habilitei o CORS para permitir que aplicações front-end possam consumir a API sem restrições. Após isso foi definido o método GET, permitindo que a função lambda envie requisições para obter dados capturados pelo scraper. Em sequência realizei a integração desse método com a Lambda Scrap, garantindo que cada requisição direcionada ao endpoint acione a função Scrap para realizar o web-scraping. Por fim a API foi implantada no estágio dev e gerada a Invoke URL https://vwumu4a4lb.execute-api.us-east-2.amazonaws.com/dev .

### Testes da API:
Ao acessar o prompt de comando e executar a requisição via cURL utilizando o comando  (curl --request GET --url https://vwumu4a4lb.execute-api.us-east-2.amazonaws.com/dev/Scrap) o API Gateway processou a chamada e enciaminhou a requisição para a função Scrap no AWS Lambda. Em seguida a função executou o scraping dos produtos e retornou uma resposta HTTP 200. Também retornando a mensagem com as informações dos produtos capturados.

![Image](https://github.com/user-attachments/assets/86b85ecb-33fb-4ad7-9026-1342b03ac3f9)

Em paralelo, ao fim do código, o  DynamoDB foi atualizado. Onde foi possível verificar a persistência dos registros extraídos e confirmando que novos dados foram armazenados corretamente no banco de dados.

![Image](https://github.com/user-attachments/assets/280e03c2-ab50-4dd9-b02b-b15afe5aa569)

### Configuração IAM:
A configuração de permissões do APIGateway no IAM  ficou da seguinte forma:

![Image](https://github.com/user-attachments/assets/beaf137d-56d7-4a11-aaeb-264797dc3c06)

E a configuração JSON ficou da seguinte forma:

![Image](https://github.com/user-attachments/assets/3a03862e-7e2d-476b-ab04-c58897068d4d)

A configuração de permissões do Scrap Lambda no IAM  ficou da seguinte forma:

![Image](https://github.com/user-attachments/assets/7cfa97b8-41d2-46fb-84e2-9965ef7f7720)

E essa a configuração JSON do DynamoDB:

![Image](https://github.com/user-attachments/assets/36090f18-5051-4c3f-a783-d9c8e3fa7a4b)

### Fluxograma da Aplicação:

![Image](https://github.com/user-attachments/assets/1515add6-46e4-41ab-bb9c-5dd5f0c54c38)

