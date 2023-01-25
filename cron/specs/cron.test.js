const { handler } = require('../index');
const { CreateTable, InsertItems } = require('../test/utils');
const { db } = require('../db/connect');

const { TableName } = process.env;

const items = [
	{
		roomId: { S: 'room1' },
		timestamp: { N: 1590006000000 },
		processed: { N: 0 },
		stayId: { S: 'stay1' },
		hotelId: { S: 'hotel1' },
		measures: {
			M: { watt: { N: 10 }, h2o: { N: 5.21 } }
		}
	},
	{
		roomId: { S: 'room2' },
		timestamp: { N: 1590006000000 },
		processed: { N: 1 }
	}
];

beforeEach(async () => {
	try {
		await CreateTable(db);
		await InsertItems(db, items);
	} catch (e) {
		console.log('beforeEach error:', e);
	}
});

describe('CRON', () => {
	test('Test', async () => {
		const event = {};
		const context = {};

		const result = await handler(event, context);
		expect(result.statusCode).toBe(200);
	});
});
