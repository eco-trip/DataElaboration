/* eslint-disable camelcase */
const { Source } = require('../model/Source');
const { Hotel } = require('../model/Hotel');

exports.queryDataToProcess = async () => {
	try {
		const items = await Source.query('processed').eq(0).and().where('stayId').exists().using('processed-index').exec();

		return Promise.resolve(items);
	} catch (error) {
		return Promise.reject(error);
	}
};

exports.getHotelInfo = async hotelId => {
	try {
		const hotel = await Hotel.query('pk')
			.eq('HOTEL#' + hotelId)
			.and()
			.where('sk')
			.beginsWith('METADATA#')
			.limit(1)
			.exec();

		if (!hotel.count) return Promise.resolve(false);

		return Promise.resolve(hotel[0]);
	} catch (error) {
		return Promise.reject(error);
	}
};

exports.normalizeSample = (v, s) => (v ? (v / 3600) * s : 0);

exports.calculateCo2 = ({ current, hot_flow_rate, cold_flow_rate, electricityCost, hotWaterCost }) =>
	current * electricityCost + (hot_flow_rate + cold_flow_rate) * hotWaterCost;

exports.calculatePoint = ({ co2 }) => Math.round(Math.max(1000 - co2, 0));
