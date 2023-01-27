const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

if (process.env.Env === 'local' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
	dotenv.config({ path: path.resolve(__dirname, '.env.development') });
} else {
	dotenv.config();
}

const { Env } = process.env;
require('./db/connect');

const { queryDataToProcess, getHotelInfo } = require('./helpers/lib');

const response = (statusCode, txt) => {
	if (statusCode >= 400) {
		console.log(`ERROR:`, txt);
	} else {
		console.log(`OK:`, txt);
	}
	return {
		statusCode,
		body: JSON.stringify(txt)
	};
};

exports.handler = async (event, context) => {
	console.log('Env', Env);

	let toProcess;

	try {
		toProcess = await queryDataToProcess();
	} catch (error) {
		return response(500, error);
	}

	let stays = toProcess.reduce((acc, item) => {
		if (!acc[item.stayId])
			acc[item.stayId] = {
				stayId: item.stayId,
				hotelId: item.hotelId,
				roomId: item.roomId,
				hot_flow_rate: 0,
				cold_flow_rate: 0,
				current: 0,
				samples: 0
			};

		acc[item.stayId].hot_flow_rate += (item.measures.hot_flow_rate / 3600) * item.measures.sample_duration;
		acc[item.stayId].cold_flow_rate += (item.measures.cold_flow_rate / 3600) * item.measures.sample_duration;
		acc[item.stayId].current += (item.measures.current / 3600) * item.measures.sample_duration;
		acc[item.stayId].samples += 1;

		return acc;
	}, {});

	stays = await Promise.all(
		Object.values(stays).map(async item => {
			const hotel = await getHotelInfo(item.hotelId);
			item.electricityCost = hotel.electricityCost;
			item.hotWaterCost = hotel.hotWaterCost;

			return item;
		}, {})
	);

	// insert items

	// update processed

	console.log('stays', stays);

	return response(200, 'ok');
};
