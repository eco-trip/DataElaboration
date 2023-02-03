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

const {
	queryDataToProcess,
	getHotelInfo,
	getElaboration,
	normalizeSample,
	calculatePoint,
	calculateCo2,
	toFixedNumber
} = require('./helpers/lib');
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

	if (toProcess.length === 0) return response(200, `Nothing to elaborate`);

	// aggregation by stayId
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

		acc[item.stayId].hot_flow_rate += normalizeSample(item.measures.hot_flow_rate, item.sample_duration);
		acc[item.stayId].cold_flow_rate += normalizeSample(item.measures.cold_flow_rate, item.sample_duration);
		acc[item.stayId].current += normalizeSample(item.measures.current, item.sample_duration);
		acc[item.stayId].samples += 1;

		return acc;
	}, {});

	// process value
	stays = await Promise.all(
		Object.values(stays).map(async item => {
			const hotel = await getHotelInfo(item.hotelId);
			if (!hotel) {
				console.log(`ERROR: hotelID ${item.hotelId} not found`);
				return item;
			}

			item.electricityCost = hotel.electricityCost;
			item.hotWaterCost = hotel.hotWaterCost;

			const elaboration = await getElaboration(item.roomId, item.stayId);
			if (elaboration) {
				item.hot_flow_rate += elaboration.hot_flow_rate;
				item.cold_flow_rate += elaboration.cold_flow_rate;
				item.current += elaboration.current;
				item.samples += elaboration.samples;
				item.co2 = elaboration.co2;
				item.points = elaboration.points;
			}

			item.hot_flow_rate = toFixedNumber(item.hot_flow_rate);
			item.cold_flow_rate = toFixedNumber(item.cold_flow_rate);
			item.current = toFixedNumber(item.current);
			item.samples = toFixedNumber(item.samples);
			item.co2 = toFixedNumber(item.co2);
			item.points = toFixedNumber(item.points);

			item.co2 = calculateCo2(item);
			item.points = calculatePoint(item);

			return item;
		}, {})
	);

	// save elaboration
	Elaboration.batchPut(stays);

	// update processed
	await Promise.all(
		toProcess.map(async element => {
			await Source.update({ roomId: element.roomId, timestamp: element.timestamp }, { processed: 1 });
		})
	);

	return response(200, `Data Elaboration of ${toProcess.length} samples Complete`);
};
