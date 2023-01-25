const { handler } = require('../index');

describe('CRON', () => {
	test('Test', async () => {
		const event = {};
		const context = {};

		const result = await handler(event, context);
		expect(result.statusCode).toBe(500);
		expect(result.headers);
	});
});
