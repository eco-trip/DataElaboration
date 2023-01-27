const dynamoose = require('dynamoose');

const schema = new dynamoose.Schema({
	roomId: {
		type: String,
		hashKey: true,
		required: true
	},
	timestamp: {
		type: Number,
		rangeKey: true,
		index: { global: true, name: 'timestamp-index' },
		required: true
	},
	processed: {
		type: Number,
		index: { global: true, name: 'processed-index' },
		required: true
	},
	hotelId: String,
	stayId: String,
	measures: Object
});

const Source = dynamoose.model('Source', schema);

Source.serializer.add('response', {
	exclude: ['pk', 'sk'],
	modify: (serialized, original) => ({ ...serialized })
});

module.exports.Source = Source;
