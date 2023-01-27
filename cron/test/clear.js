const { Elaboration } = require('../model/Elaboration');
const { Source } = require('../model/Source');

exports.clear = async () => {
	try {
		const e = await Elaboration.scan().exec();
		await Promise.all(e.map(row => row.delete()));

		const s = await Source.scan().exec();
		await Promise.all(s.map(row => row.delete()));
	} catch (error) {
		console.error('DynamnoDB clear error!', error);
	}
};
