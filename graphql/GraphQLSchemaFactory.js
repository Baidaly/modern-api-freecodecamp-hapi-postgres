const { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql');
const PaintingType = require('./types/PaintingType');
const painting = require('../models/painting');
const Joi = require('Joi');

class GraphQLSchemaFactory {
    constructor(options) {
        Joi.validate(options, Joi.object().keys({
            painting: Joi.object().required()
        }));

        this.painting = options.painting;
    }

    getSchema() {
        const me = this;

        const RootQuery = new GraphQLObjectType({
            name: 'RootQueryType',
            fields: {
                paintings: {
                    type: new GraphQLList(PaintingType),
                    resolve(parent, args) {
                        return me.painting.findAll();
                    }
                },
                painting: {
                    type: PaintingType,
                    args: {
                        id: {
                            type: GraphQLString
                        }
                    },
                    resolve(parent, args) {
                        return me.painting.findById(args.id);
                    }
                }
            }
        });

        return new GraphQLSchema({
            query: RootQuery
        });
    }
}

module.exports = GraphQLSchemaFactory;