const { handler } = require('../index');

describe('GET /', () => {
	test('Test', async () => {
		const event = {
			resource: '/',
			path: '/',
			httpMethod: 'GET',
			headers: {
				Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
			}
		};
		const context = {};

		const result = await handler(event, context);
		expect(result.statusCode).toBe(401);
		expect(result.headers);
	});
});
