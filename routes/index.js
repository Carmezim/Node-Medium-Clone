const router = require('express').Router();

router.use('/', require('./users'));

router.use((err, req, res, next) => { 
  if (err.name === 'validationError'){
    return res.status(422).json({
      errors: Object.keys(err.erros).reduce((errors, key) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});
module.exports = router;