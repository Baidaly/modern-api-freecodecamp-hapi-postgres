const hapi = require('hapi');
const Sequelize = require('sequelize');
const DataGenerator = require('./services/dataGenerator');
const Painting = require('./models/painting');

const conString = "postgres://baidaly:@localhost:5432/test";

const sequelize = new Sequelize(conString);

const server = hapi.server({
    port: 3333,
    host: 'localhost'
});

const init = async () => {
    try {
        await sequelize.authenticate();
    } catch (e) {
        console.error('Unable to connect to the database:', err);
    }
    console.log('Connection has been established successfully.');

    const painting = Painting(sequelize);
    await painting.sync({force: true});

    const dataGenerator = new DataGenerator({
        painting
    });
    await dataGenerator.generateData();

    server.route([{
        method: 'GET',
        path: '/',
        handler: (req, resp) => {
            return '<h1>My modern API</h1>';
        }
    }, {
        method: 'GET',
        path: '/api/v1/paintings',
        handler: async (req, resp) => {
            let results = await painting.findAll();
            return results;
        }
    }, {
        method: 'POST',
        path: '/api/v1/paintings',
        handler: async (req, resp) => {
            const { name, url, techniques } = req.payload;

            const result = await painting.create({
                name: name,
                url: url,
                techniques: techniques
            });

            return result;
        }
    }]);

    await server.start();
    console.log(`Server is running at ${server.info.uri}`);
};

init();