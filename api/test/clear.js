const { Elaboration } = require('../model/Elaboration');

exports.clear = async () => {
	try {
		const e = await Elaboration.scan().exec();
		await Promise.all(e.map(row => row.delete()));
	} catch (error) {
		console.error('DynamnoDB clear error!', error);
	}
};
