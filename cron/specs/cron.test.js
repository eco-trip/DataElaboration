const { handler } = require('../index');
const { CreateTable, InsertItems, generateRawData } = require('../test/utils');
const { db } = require('../db/connect');
const { queryDataToProcess, getHotelInfo } = require('../helpers/lib');

const { SOURCE_TABLE, DEST_TABLE, HOTEL_TABLE } = process.env;

beforeAll(async () => {
	await CreateTable(db, HOTEL_TABLE);
	await InsertItems(db, HOTEL_TABLE, [
		{ pk: { S: 'HOTEL#1' }, sk: { S: 'METADATA#1' }, electricityCost: { N: 10 }, hotWaterCost: { N: 5 } }
	]);
	await InsertItems(db, HOTEL_TABLE, [
		{ pk: { S: 'HOTEL#2' }, sk: { S: 'METADATA#2' }, electricityCost: { N: 46.25 }, hotWaterCost: { N: 12.6 } }
	]);
});
beforeEach(async () => {
	try {
		await CreateTable(db, SOURCE_TABLE);
		await CreateTable(db, DEST_TABLE);
	} catch (e) {
		console.log('beforeEach error:', e);
	}
});

describe('[LIB] Query data to process', () => {
	test('No raw data should be nothing to process', async () => {
		const result = await queryDataToProcess();
		expect(result.length).toBe(0);
	});

	test('Raw data to process should be a list excluding already processed', async () => {
		await InsertItems(
			db,
			SOURCE_TABLE,
			generateRawData(10, { roomId: 'ROOM#1', hotelId: 'HOTEL#1', stayId: 'STAY#1', processed: 1 })
		);
		await InsertItems(
			db,
			SOURCE_TABLE,
			generateRawData(5, { roomId: 'ROOM#2', hotelId: 'HOTEL#1', stayId: 'STAY#2', processed: 0 })
		);

		const result = await queryDataToProcess();
		expect(result.length).toBe(5);
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

test.skip('cazzo', async () => {
	const event = {};
	const context = {};

	await InsertItems(
		db,
		SOURCE_TABLE,
		generateRawData(10, { roomId: 'ROOM#1', hotelId: 'HOTEL#1', stayId: 'STAY#1', processed: 0 })
	);
	await InsertItems(
		db,
		SOURCE_TABLE,
		generateRawData(5, { roomId: 'ROOM#2', hotelId: 'HOTEL#1', stayId: 'STAY#2', processed: 0 })
	);

	const result = await handler(event, context);
	expect(result.statusCode).toBe(200);
});
