const dynamoose = require('dynamoose');

const schema = new dynamoose.Schema(
	{
		roomId: {
			type: String,
			hashKey: true,
			required: true
		},
		stayId: {
			type: String,
			rangeKey: true,
			index: { global: true, name: 'stay-index' },
			required: true
		},
		hotelId: {
			type: String,
			index: { global: true, name: 'hotel-index' },
			required: true
		},
		samples: Number,
		current: Number,
		cold_flow_rate: Number,
		hot_flow_rate: Number,
		co2: Number,
		points: Number
	},
	{
		timestamps: true
	}
);

const Elaboration = dynamoose.model('Elaboration', schema);

module.exports.Elaboration = Elaboration;
