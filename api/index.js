const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

if (process.env.Env === 'local' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
	dotenv.config({ path: path.resolve(__dirname, '.env.development') });
} else {
	dotenv.config();
}

const { Env, GUEST_JWT_SECRET } = process.env;
require('./db/connect');
const { Elaboration } = require('./model/Elaboration');

const response = (statusCode, txt) => {
	if (statusCode >= 400) {
		console.log(`ERROR:`, txt);
	} else {
		console.log(`OK:`, txt);
	}
	return {
		statusCode,
		body: JSON.stringify(txt)
	};
};

exports.handler = async (event, context) => {
	console.log('Env', Env);

	const authHeader = event.headers ? event.headers.Authorization : null;
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return response(401, { error: 'Missing token' });

	let decoded;
	try {
		decoded = jwt.verify(token, GUEST_JWT_SECRET);
		console.log('decoded', decoded);
	} catch (err) {
		return response(401, { error: 'Unauthorized' });
	}

	try {
		const elaboration = await Elaboration.query('stayId').eq(decoded.stayId).limit(1).exec();

		if (!elaboration.count) return response(400, { error: 'Not Found' });

		return response(200, elaboration[0]);
	} catch (error) {
		return response(500, error);
	}
};
