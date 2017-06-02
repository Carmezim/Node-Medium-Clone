const mongoose = require('mongoose');
const User = mongoose.model('User');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');


const ArticleSchema = new mongoose.Schema({
	slug: { type: String, lowercase: true, unique: true },
	title: String,
	description: String,
	body: String,
	favoritesCount: { type: Number, default: 0 },
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
	tagList: [{ type: String }],
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ArticleSchema.pre('validate', function(next) {
	this.slugify();

	next();
});

ArticleSchema.methods.slugify = function () {
	this.slug = slug(this.title);
};

ArticleSchema.methods.toJSONfor = function (user) {
	return {
		slug: this.slug,
		title: this.title,
		description: this.description,
		body: this.body,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		tagList: this.tagList,
		favorited: user ? user.isFavorite(this._id) : false,
		favoritesCount: this.favoritesCount,
		author: this.author.toProfileJSONFor(user)
	};
};

ArticleSchema.methods.updateFavoriteCounte = function() {
	const article = this;

	return User.count({favorites: {$in: [aritcle_id]}}).then(function (count) {
		article.favoritesCount = count;

		return articles.save();
	});
};

mongoose.model('Article', ArticleSchema);