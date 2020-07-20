const dotenv = require('dotenv');
const express = require("express");
const router = express.Router();

const blogSchema = require('../../models/Blog');

// Grab the .env configuration
dotenv.config();

// Get Last Blogs
router.route('/').get((req, res, next) => {
    try {

        blogSchema.aggregate([
            {
                "$match": {
                    "disabled": false || null
                }
            }, {
                "$lookup": {
                    "from": "users", // collection name in db
                    "localField": "created.person",
                    "foreignField": "_id",
                    "as": "author"
                }
            }, {
                "$unwind": "$author"
            }, {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "body": 1,
                    "url": 1,
                    "cover": 1,
                    "colour": 1,
                    "created": 1,
                    "author.username": 1,
                    "author.title": 1
                }
            }
        ], (error, response) => {
            if (error) {
                return next(error)
            } else {
                res.status(200).json(response)
            }
        }).sort({
            _id: -1
        }).limit(10);
        
    } catch (err) {
        return res.status(200).json({
            status: "error",
            message: "No blogs were found"
        });
    }
});

// Get Last Blogs
router.route('/:id').get((req, res, next) => {
    try {
        blogSchema.aggregate([
            {
                "$match": {
                    "type": req.params.id,
                    "disabled": false || null
                }
            }, {
                "$lookup": {
                    "from": "users", // collection name in db
                    "localField": "created.person",
                    "foreignField": "_id",
                    "as": "author"
                }
            }, {
                "$unwind": "$author"
            }, {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "body": 1,
                    "url": 1,
                    "cover": 1,
                    "colour": 1,
                    "created": 1,
                    "author.username": 1,
                    "author.title": 1
                }
            }
        ], (error, response) => {
            if (error) {
                return next(error)
            } else {
                res.status(200).json(response)
            }
        }).sort({
            _id: -1
        }).limit(10);
    } catch (err) {
        return res.status(200).json({
            status: "error",
            message: "No blogs were found"
        });
    }
});

// Get Last Blogs
router.route('/post/:id').get((req, res, next) => {
    try {

        blogSchema.aggregate([
            {
                "$match": {
                    "url": req.params.id,
                    "disabled": false || null
                }
            }, {
                "$lookup": {
                    "from": "users", // collection name in db
                    "localField": "created.person",
                    "foreignField": "_id",
                    "as": "author"
                }
            }, {
                "$unwind": "$author"
            }, {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "body": 1,
                    "url": 1,
                    "cover": 1,
                    "created": 1,
                    "author.username": 1,
                    "author.title": 1
                }
            }
        ], (error, response) => {
            if (error) {
                return next(error)
            } else {
                res.status(200).json(response)
            }
        }).sort({
            _id: -1
        }).limit(5);

    } catch (err) {
        return res.status(200).json({
            status: "error",
            message: "No blogs were found"
        });
    }
});

module.exports = router;