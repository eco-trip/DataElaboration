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

const { queryDataToProcess, getHotelInfo, normalizeSample, calculatePoint, calculateCo2 } = require('./helpers/lib');
const { Elaboration } = require('./model/Elaboration');
const { Source } = require('./model/Source');

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

		acc[item.stayId].hot_flow_rate += normalizeSample(item.measures.hot_flow_rate, item.measures.sample_duration);
		acc[item.stayId].cold_flow_rate += normalizeSample(item.measures.cold_flow_rate, item.measures.sample_duration);
		acc[item.stayId].current += normalizeSample(item.measures.current, item.measures.sample_duration);
		acc[item.stayId].samples += 1;

		return acc;
	}, {});

	stays = await Promise.all(
		Object.values(stays).map(async item => {
			const hotel = await getHotelInfo(item.hotelId);
			item.electricityCost = hotel.electricityCost;
			item.hotWaterCost = hotel.hotWaterCost;
			item.co2 = calculateCo2(item);
			item.points = calculatePoint(item);

			return item;
		}, {})
	);

	// insert items
	Elaboration.batchPut(stays);

	// update processed
	await Promise.all(
		toProcess.map(async element => {
			await Source.update({ roomId: element.roomId, timestamp: element.timestamp }, { processed: 1 });
		})
	);

	return response(200, `Data Elaboration of ${toProcess.length} samples Complete`);
};
