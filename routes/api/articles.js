const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');
const Comment = mongoose.model('Comment');
const auth = require('../auth');


// Preload article objects on routes with ':article'
router.param('article', function (req, res, next, slug) {
	Article.findOne({ slug: slug })
	.populate('author')
	.then(function (article) {
		if (!article) { return res.sendStatus(404); }

		req.article = article;

		return next();
	}).catch(next);
});

router.post('/', auth.required, function(req, res, next) {
	User.findById(req.payload.id).then(function (user) {
		if (!user) { return res.sendStatus(401); }

		const article = new Article(req.body.article);

		article.author = user;

		return article.save().then(function () {
			console.log(article.author);
			return res.json({article: article.toJSONFor(user)});
		});
	}).catch(next);
});

// return an article
router.get(':/article', auth.optional, function(req, res, next) {
	Promise.all([
		req.payload ? User.findById(req.payload.id) : null,
		req.article.populate('author').execPopulate()
	]).then(function (results) {
		const user = results[0];

		return res.json({articles: req.article.toJSONFor(user)});
	}).catch(next);
});

// update article
router.put('/:article', auth.required, function (req, res, next) {
	if (req.article._id.toString() === req.payload.id.toString()) {
		if (typeof req.body.article.title !== 'undefined') {
			req.article.title = req.body.article.title;
		}

		if (typeof req.body.article.description !== 'undefined') {
			req.article.body = req.body.article.description;
		}

		if (typeof req.body.article.body !== 'undefined') {
			req.article.body = req.body.article.body;
		}

		req.article.save().then(function (article) {
			return res.json({article: article.toJSONFor(user)});
		}).catch(next);
	} else {
		return res.send(403);
	}
});

// delete article 
router.delete('/:article', auth.required, function (req, res, next) {
	User.findById(req.payload.id).then(function () {
		if (req.article.author.toString() === req. payload.id.toString()) {
			return req.article.remove().then(function () {
				return sendStatus(204);
			});
		} else {
			return res.sendStatus(403);
		}
	});
});

// favorite an article
router.post('/:article/favorite', auth.required, function (req, res, next) {
	const articleId = req.article._id;

	User.findById(req.payload.id).then(function (user) {
		if (!user) { return res.sendStatus(401); }

		return user.favorite(articleId).then(function () {
			return req.article.updateFavoriteCount().then(function (article) {
				return res.json({article: article.toJSONFor(user)});
			});
		});
	}).catch(next);
});

// unfavorite an article
router.delete('/:article/favorite', auth.required, function (req, res, next) {
	const articleId = req.article._id;

	User.findById(req.payload.id).then(function (user) {
		if (!user) { return res.sendStatus(401); }

		return user.unfavorite(articleId).then(function () {
			return req.article.updateFavoriteCount().then(function (article) {
				return res.json({article: article.toJSONFor(user)});
			});
		});
	}).catch(next);
});

router.param('comment', function (req, res, next) {
	Comment.findById(id).then(function (comment) {
		if(!comment) { return res.sendStatus(404); }

		req.comment = comment;

		return next();
	}).catch(next);
});

router.get('/:article/comments', auth.optional, function (req, res, next) {
	Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
		return req.article.populate({
			path: 'comments',
			populate: {
				path: 'author'
			},
			options: {
				sort: {
					createdAt: 'desc'
				}
			}
		}).execPopulate().then(function (article) {
			return res.json({comments: req.article.comments.map(function(comment) {
				return comment.toJSONFor(user);
			})});
		});
	}).catch(next);
});

router.delete(':/article/comments/:comment', auth.required, function (req, res, next) {
	if (req.comment.author.toString() === req.payload.id.toString()) {
		req.article.comments.remove(req.comment._id);
		req.article.save()
			.then(Comment.find({_id: req.comment._id}).remote().exec())
			.then(function () {
				res.sendStatus(204);
			});
	} else {
		res.sendStatus(403);
	}
});

module.exports = router;
