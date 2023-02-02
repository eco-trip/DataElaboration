const jwt = require('jsonwebtoken');

const { handler } = require('../index');
require('../db/connect');

const { GUEST_JWT_SECRET } = process.env;

const { clear } = require('../test/clear');
const { Elaboration } = require('../model/Elaboration');

const stayElaboration = {
	cold_flow_rate: 0.02,
	current: 5.82,
	hot_flow_rate: 0.04,
	co2: 58.5,
	stayId: 'STAY#1',
	hotelId: '1',
	roomId: 'ROOM#1',
	samples: 6,
	points: 942
};

beforeEach(async () => {
	await clear();
});

describe('GET /', () => {
	test("Get stay's elaboration without token shoukd be missing token", async () => {
		const event1 = {
			resource: '/',
			path: '/',
			httpMethod: 'GET'
		};

		const result1 = await handler(event1, {});
		expect(result1.statusCode).toBe(401);
		console.log(result1.body);
		expect(JSON.parse(result1.body)).toEqual(expect.objectContaining({ error: 'Missing token' }));

		const event2 = {
			resource: '/',
			path: '/',
			httpMethod: 'GET',
			headers: {
				Test: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
			}
		};

		const result2 = await handler(event2, {});
		expect(result2.statusCode).toBe(401);
		expect(JSON.parse(result2.body)).toEqual(expect.objectContaining({ error: 'Missing token' }));
	});

	test("Get stay's elaboration with wrong token shoukd be Unauthorized", async () => {
		const event = {
			resource: '/',
			path: '/',
			httpMethod: 'GET',
			headers: {
				Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
			}
		};

		const result = await handler(event, {});
		expect(result.statusCode).toBe(401);
		expect(JSON.parse(result.body)).toEqual(expect.objectContaining({ error: 'Unauthorized' }));
	});

	test("Get stay's elaboration whit correct token but wrong stayId shoukd be NotFound", async () => {
		await Elaboration.batchPut([stayElaboration]);

		const token = jwt.sign({ stayId: 'wrong' }, GUEST_JWT_SECRET);
		const event = {
			resource: '/',
			path: '/',
			httpMethod: 'GET',
			headers: {
				Authorization: 'Bearer ' + token
			}
		};

		const result = await handler(event, {});
		expect(result.statusCode).toBe(400);
		expect(JSON.parse(result.body)).toEqual(expect.objectContaining({ error: 'Not Found' }));
	});

	test("Get stay's elaboration without correct information shoukd be Ok", async () => {
		await Elaboration.batchPut([stayElaboration]);

		const token = jwt.sign({ stayId: 'STAY#1' }, GUEST_JWT_SECRET);
		const event = {
			resource: '/',
			path: '/',
			httpMethod: 'GET',
			headers: {
				Authorization: 'Bearer ' + token
			}
		};

		const result = await handler(event, {});
		expect(result.statusCode).toBe(200);
		console.log(result.body);

		const obj = JSON.parse(result.body);

		expect(obj.current).toEqual(stayElaboration.current);
		expect(obj.hot_flow_rate).toEqual(stayElaboration.hot_flow_rate);
		expect(obj.co2).toEqual(stayElaboration.co2);
		expect(obj.stayId).toEqual(stayElaboration.stayId);
		expect(obj.hotelId).toEqual(stayElaboration.hotelId);
		expect(obj.roomId).toEqual(stayElaboration.roomId);
		expect(obj.samples).toEqual(stayElaboration.samples);
		expect(obj.points).toEqual(stayElaboration.points);
	});
});
