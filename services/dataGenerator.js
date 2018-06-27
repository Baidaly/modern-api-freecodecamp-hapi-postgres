const Joi = require('joi');
const faker = require('faker');

class DataGenerator {
    constructor(options) {
        Joi.validate(options, Joi.object().keys({
            painting: Joi.object().required()
        }));

        this.painting = options.painting;
    }

    async generateData() {
        const count = 10;

        for (let i = 0; i < count; i++) {
            this.painting.create({
                name: faker.fake("{{name.lastName}}, {{name.firstName}} {{name.suffix}}"),
                url: faker.image.imageUrl(),
                techniques: Array.from({length: 5}, () => faker.random.word())
            });
        }
    }
}

module.exports = DataGenerator;