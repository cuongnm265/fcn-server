let express = require('express');
let router = express.Router();
let redisClient = require('../bin/redis-client/redis-client');


const chalk = require('chalk');

let categoryService = require('../mongoose/services/category-service');
let articleService = require('../mongoose/services/article-service');
let categoryCacheService = require('../mongoose/services/cache/category-cache-service');

/**
 *  Category Router
 */

router.route('/')
    /*GET: Get all categories */
    .get(function (req, res) {
        redisClient.get('categories', function (err, categories) {
            if (categories)
                res.status(200).send(JSON.parse(categories));
            else {
                categoryService.findAll(function (err, docs) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        categoryCacheService.initCategoryCache();
                        res.status(200).send(docs);
                    }
                });
            }
        });
    })
    /** POST: Submit new category to server */
    .post(function (req, res) {
        let category = req.body;
        categoryService.save(category, function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(201).send();
            }
        });
    });

router.route('/articles/trending')
    .get(function (req, res) {
        articleService.findAllTrendingArticles().then((articles) => {
            res.status(200).send(articles);
        }).catch((err) => {
            res.status(400).send(err);
        });
    });

router.route('/articles/latest')
    .get(function (req, res) {
        articleService.findAllLatestArticles().then((articles) => {
            res.status(200).send(articles);
        }).catch((err) => {
            res.status(400).send(err);
        });
    });


/**
 * ROUTE: with category_id
 */

router.route('/:categoryId')
    /**GET: Get category with _id */
    .get(function (req, res) {
        let categoryId = req.params.categoryId;
        categoryService.findOne(categoryId, function (err, doc) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(doc);
            }
        });
    })
    /** PUT: Update document */
    .put(function (req, res) {
        let categoryId = req.params.categoryId;
        let category = req.body;
        categoryService.update(categoryId, category, function (err) {
            if (err) {
                res.status(404).send(err);
            } else {
                res.status(202).send();
            }
        })
    })
    /** DELETE: Remove document */
    .delete(function (req, res) {
        let categoryId = req.params.categoryId;
        categoryService.remove(categoryId, function (err) {
            if (err) {
                res.status(404).send(err);
            } else {
                res.status(202).send();
            }
        })
    });


router.route('/:category/articles')
    .get(function (req, res) {
        let category = req.params.category;
        articleService.findByCategory(category, function (err, docs) {
            if (err) {
                res.status(404).send(err);
            } else {
                res.status(200).send(docs);
            }
        });
    });

router.route('/:category/articles/trending')
    .get(function (req, res) {
        let category = req.params.category;
        articleService.findTrendingArticlesByCategory(category).then((articles) => {
            res.status(200).send(articles);
        }).catch((err) => {
            res.status(400).send(err);
        });
    });

router.route('/:category/articles/latest')
    .get(function (req, res) {
        let category = req.params.category;
        articleService.findLatestArticlesByCategory(category).then((articles) => {
            res.status(200).send(articles);
        }).catch((err) => {
            res.status(400).send(err);
        });
    })

module.exports = router;