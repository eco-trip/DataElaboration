const { handler } = require('../index');
require('../db/connect');

const { clear } = require('../test/clear');
const { generateRawData, compareElaboration } = require('../test/utils');
const { queryDataToProcess, getHotelInfo, calculateCo2 } = require('../helpers/lib');

const { Elaboration } = require('../model/Elaboration');
const { Source } = require('../model/Source');
const { Hotel } = require('../model/Hotel');

beforeAll(async () => {
	await Hotel.batchPut([
		{ pk: 'HOTEL#1', sk: 'METADATA#1', electricityCost: 10, hotWaterCost: 5 },
		{ pk: 'HOTEL#2', sk: 'METADATA#2', electricityCost: 46.25, hotWaterCost: 12.6 }
	]);
});

beforeEach(async () => {
	await clear();
});

describe('[LIB] Query data to process', () => {
	test('No raw data should be nothing to process', async () => {
		const result = await queryDataToProcess();
		expect(result.length).toBe(0);
	});

	test('Raw data to process should be a list excluding already processed', async () => {
		await Source.batchPut([
			...generateRawData(10, { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', processed: 1 }),
			...generateRawData(5, { roomId: 'ROOM#2', hotelId: '2', stayId: 'STAY#2', processed: 0 })
		]);

		const result = await queryDataToProcess();
		expect(result.length).toBe(5);
	});

	test('Raw data to process should be a list excluding already processed and without stayId', async () => {
		await Source.batchPut([
			...generateRawData(5, { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', processed: 1 }),
			...generateRawData(5, { roomId: 'ROOM#2', hotelId: '1', processed: 0 }),
			...generateRawData(10, { roomId: 'ROOM#3', hotelId: '1', stayId: 'STAY#1', processed: 0 })
		]);

		const result = await queryDataToProcess();
		expect(result.length).toBe(10);
	});
});

describe('[LIB] Get Hotel info', () => {
	test('No hotelId should be false ', async () => {
		const result1 = await getHotelInfo();
		expect(result1).toBe(false);

		const result2 = await getHotelInfo('not');
		expect(result2).toBe(false);
	});
	test('Existing hotelId should be an object withoud dynamodb info', async () => {
		const result1 = await getHotelInfo('1');
		expect(result1.pk).toEqual('HOTEL#1');
		expect(result1.electricityCost).toEqual(10);
		expect(result1.hotWaterCost).toEqual(5);

		const result2 = await getHotelInfo('2');
		expect(result2.pk).toEqual('HOTEL#2');
		expect(result2.electricityCost).toEqual(46.25);
		expect(result2.hotWaterCost).toEqual(12.6);
	});
});

describe('[CRON] lambda test', () => {
	test('Data elaboration with new data entry for stay', async () => {
		const m1 = [
			{ hot_flow_rate: 0, cold_flow_rate: 0, current: 0, sample_duration: 5 },
			{ hot_flow_rate: 5, cold_flow_rate: 5, current: 1500, sample_duration: 5 },
			{ hot_flow_rate: 4, cold_flow_rate: 1, current: 600, sample_duration: 5 }
		];

		const m2 = [
			{ hot_flow_rate: 0, cold_flow_rate: 0, current: 0, sample_duration: 5 },
			{ hot_flow_rate: 10, cold_flow_rate: 10, current: 2000, sample_duration: 5 }
		];

		await Source.batchPut([
			...generateRawData(3, { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', processed: 0 }, m1),
			...generateRawData(2, { roomId: 'ROOM#2', hotelId: '2', stayId: 'STAY#2', processed: 0 }, m2)
		]);

		const result = await handler({}, {});
		expect(result.statusCode).toBe(200);

		const elaboration = await Elaboration.scan().exec();
		expect(elaboration.length).toBe(2);

		compareElaboration(elaboration[0], { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', measures: m1 });
		expect(elaboration[0].co2).toBe(calculateCo2({ ...elaboration[0], electricityCost: 10, hotWaterCost: 5 }));

		compareElaboration(elaboration[1], { roomId: 'ROOM#2', hotelId: '2', stayId: 'STAY#2', measures: m2 });
		expect(elaboration[1].co2).toBe(calculateCo2({ ...elaboration[1], electricityCost: 46.25, hotWaterCost: 12.6 }));

		const toProcess = await queryDataToProcess();
		expect(toProcess.length).toBe(0);
	});

	test.todo('Data elaboration with already existing stay to update');
});
