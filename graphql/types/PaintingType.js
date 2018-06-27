const { GraphQLList, GraphQLObjectType, GraphQLString } = require('graphql');

const PaintingType = new GraphQLObjectType({
    name: 'Painting',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        url: { type: GraphQLString },
        techniques: { type: new GraphQLList(GraphQLString) }
    })
});

module.exports = PaintingType;