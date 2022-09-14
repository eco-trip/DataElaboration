exports.handler = async (event, context, callback) => {
	console.log('--LAMBDA LOG');
	console.log('event', event);
	console.log('context', context);
	console.log('Env', process.env.Env);

	const response = {
		statusCode: 200,
		body: JSON.stringify('Lambda execute successful!')
	};

	return response;
};
