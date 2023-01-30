const dynamoose = require('dynamoose');

const { Elaboration } = require('../model/Elaboration');

const { Project, Env, Target, AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DYNAMODB_ENDPOINT } =
	process.env;

let ddb;

if (Env === 'local') {
	ddb = new dynamoose.aws.ddb.DynamoDB({
		region: AWS_DEFAULT_REGION,
		credentials: {
			accessKeyId: AWS_ACCESS_KEY_ID,
			secretAccessKey: AWS_SECRET_ACCESS_KEY
		}
	});
} else {
	ddb = new dynamoose.aws.ddb.DynamoDB({
		region: AWS_DEFAULT_REGION,
		endpoint: Env === 'test' ? DYNAMODB_ENDPOINT : undefined
	});
}

dynamoose.aws.ddb.set(ddb);

module.exports.ElaborationTable = new dynamoose.Table(`${Project}.${Env}.${Target}`, [Elaboration]);
