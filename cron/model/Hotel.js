const dynamoose = require('dynamoose');

const schema = new dynamoose.Schema({
	pk: {
		type: String,
		hashKey: true,
		required: true
	},
	sk: {
		type: String,
		rangeKey: true,
		index: { global: true, name: 'skIndex' },
		required: true
	},
	electricityCost: Number,
	hotWaterCost: Number
});

const Hotel = dynamoose.model('Hotel', schema);

module.exports.Hotel = Hotel;
