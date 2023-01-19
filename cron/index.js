exports.handler = async (event, context) => {
	console.log('event', event);
	console.log('Env', process.env.Env);

	const response = {
		statusCode: 200,
		body: JSON.stringify('[CRON] Lambda execute successful!')
	};

	return response;
};
