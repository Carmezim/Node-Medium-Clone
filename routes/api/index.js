const router = require('express').Router();

router.use('/', require('./users'));
router.user('/profiles', require('./profiles'));
router.use('/articcles', require('./articles'));

router.use(function(err, req, res, next) {
	if(err.name === 'validationError') {
		return res.status(422).json({
			errors: Object.keys(err.errors).reduce(function(errors, key) {
				errors[key] = err.errors[key].message;

				return errors;
			}, {})
		});
	}

	return next(err);
});


module.exports = router;
