exports.handler = async (event, context) => {
	console.log('--LAMBDA API');
	console.log('event', event);
	console.log('Env', process.env.Env);

	const response = {
		statusCode: 200,
		body: JSON.stringify('[API] Lambda execute successful!')
	};

	return response;
};
