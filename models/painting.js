const Sequelize = require('sequelize');

function painting(sequelize) {
    return sequelize.define('painting', {
        name: {
            type: Sequelize.STRING
        },
        url: {
            type: Sequelize.STRING
        },
        techniques: {
            type: Sequelize.STRING,
            get: function() {
                return JSON.parse(this.getDataValue('techniques'));
            },
            set: function(val) {
                return this.setDataValue('techniques', JSON.stringify(val));
            }
        }
    });
}

module.exports = painting;