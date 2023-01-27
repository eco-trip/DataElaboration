const { Elaboration } = require('../model/Elaboration');
const { Source } = require('../model/Source');
const { Hotel } = require('../model/Hotel');

exports.queryDataToProcess = async () => {
	try {
		const items = await Source.query('processed').eq(0).and().where('stayId').exists().using('processed-index').exec();

		return Promise.resolve(items.map(el => el.serialize('response')));
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
