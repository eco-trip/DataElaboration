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
	sample_duration: Number,
	measures: {
		type: Object,
		schema: {
			room_temperature: Number,
			humidity: Number,
			brightness: Number,
			hot_water_temperature: Number,
			cold_water_temperature: Number,
			hot_flow_rate: Number,
			cold_flow_rate: Number,
			current: Number
		}
	}
});

const Source = dynamoose.model('Source', schema);

module.exports.Source = Source;
