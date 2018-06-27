const hapi = require('hapi');
const Sequelize = require('sequelize');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const DataGenerator = require('./services/dataGenerator');
const Painting = require('./models/painting');
const GraphQLSchemaFactory = require('./graphql/GraphQLSchemaFactory');

const conString = "postgres://baidaly:@localhost:5432/test";

const sequelize = new Sequelize(conString);

const server = hapi.server({
    port: 3333,
    host: 'localhost'
});

async function initializeData(sequelize) {
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

    return { painting };
}

async function initRoutes(painting) {
    server.route([{
        method: 'GET',
        path: '/',
        handler: (req, resp) => {
            return `<h1>REST and GraphQL API test</h1>
                    <p><a href="documentation">Rest Documentation</a></p>
                    <p><a href="graphiql">GraphiQL</a></p>`;
        }
    }, {
        method: 'GET',
        path: '/api/v1/paintings/{id}',
        config: {
            description: 'Find a painting by id',
            tags: ['api', 'v1', 'painting']
        },
        handler: async (req, resp) => {
            return await painting.findById(req.params.id);
        }
    }, {
        method: 'GET',
        path: '/api/v1/paintings',
        config: {
            description: 'Get all paintings',
            tags: ['api', 'v1', 'painting']
        },
        handler: async (req, resp) => {
            return await painting.findAll();
        }
    }, {
        method: 'POST',
        path: '/api/v1/paintings',
        config: {
            description: 'Create a new painting',
            tags: ['api', 'v1', 'painting']
        },
        handler: async (req, resp) => {
            const {name, url, techniques} = req.payload;

            return await painting.create({
                name: name,
                url: url,
                techniques: techniques
            });
        }
    }]);
}

async function initGraphQL(painting) {
    const graphQLSchemaFactory = new GraphQLSchemaFactory({
        painting
    });

    await server.register({
        plugin: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql'
            },
            route: {
                cors: true
            }
        }
    });

    await server.register({
        plugin: graphqlHapi,
        options: {
            path: '/graphql',
            graphqlOptions: {
                schema: graphQLSchemaFactory.getSchema()
            },
            route: {
                cors: true
            }
        }
    });
}

const init = async () => {
    const { painting } = await initializeData(sequelize);

    await initGraphQL(painting);

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Painting API Documentation',
                    version: Pack.version
                }
            }
        }
    ]);

    await initRoutes(painting);

    await server.start();
    console.log(`Server is running at ${server.info.uri}`);
};

init();