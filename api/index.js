const jwt = require('jsonwebtoken');

const response = (statusCode, txt) => {
	if (statusCode >= 400) {
		console.log(`ERROR: ${txt}`);
	} else {
		console.log(`OK: ${txt}`);
	}
	return {
		statusCode,
		body: JSON.stringify(txt)
	};
};

exports.handler = async (event, context) => {
	console.log('event', event);
	console.log('Env', process.env.Env);

	const authHeader = event.headers.Authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return response(400, 'Missing token');

	try {
		const decoded = jwt.verify(token, process.env.GUEST_JWT_SECRET);
		console.log('decoded', decoded);
	} catch (err) {
		return response(401, 'Unauthorized');
	}

	return response(200, '[API] Lambda execute successful!');
};
