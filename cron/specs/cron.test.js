const { handler } = require('../index');
require('../db/connect');

const { clear } = require('../test/clear');
const { generateRawData } = require('../test/utils');
const { queryDataToProcess, getHotelInfo } = require('../helpers/lib');

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
	test.skip('proviamo', async () => {
		const m1 = { hot_flow_rate: { N: 0 }, cold_flow_rate: { N: 0 }, current: { N: 0 }, sample_duration: { N: 5 } };
		const m2 = { hot_flow_rate: { N: 5 }, cold_flow_rate: { N: 5 }, current: { N: 1500 }, sample_duration: { N: 5 } };
		const m3 = { hot_flow_rate: { N: 4 }, cold_flow_rate: { N: 1 }, current: { N: 600 }, sample_duration: { N: 5 } };
		const m4 = { hot_flow_rate: { N: 0 }, cold_flow_rate: { N: 0 }, current: { N: 0 }, sample_duration: { N: 5 } };
		const m5 = { hot_flow_rate: { N: 10 }, cold_flow_rate: { N: 10 }, current: { N: 2000 }, sample_duration: { N: 5 } };

		await Source.batchPut([
			...generateRawData(1, { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', processed: 0, measures: m1 }),
			...generateRawData(1, { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', processed: 0, measures: m2 }),
			...generateRawData(1, { roomId: 'ROOM#1', hotelId: '1', stayId: 'STAY#1', processed: 0, measures: m3 }),
			...generateRawData(1, { roomId: 'ROOM#2', hotelId: '2', stayId: 'STAY#2', processed: 0, measures: m4 }),
			...generateRawData(1, { roomId: 'ROOM#2', hotelId: '2', stayId: 'STAY#2', processed: 0, measures: m5 })
		]);

		const result = await handler({}, {});

		expect(result.statusCode).toBe(200);

		/*
		const params = {
			TableName: DEST_TABLE,
			IndexName: 'skIndex',
			KeyConditionExpression: 'stayId = :stayId',
			ExpressionAttributeValues: {
				':stayId': { S: 'STAY#1' }
			}
		};

		const check = await db.send(new QueryCommand(params));
		console.log(check);
		
		expect(check.length).toBe(1);
		*/
	});
});
