const dotenv = require('dotenv');
const express = require("express");
const Request = require("request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const contactSchema = require("../models/contact");
const { check, validationResult } = require('express-validator');

// Grab the .env configuration
dotenv.config();

// Google Recaptcha Variables
var grecaptcha = "https://www.google.com/recaptcha/api/siteverify?";

// Contact Request
router.post("/contact",
    [
        check('realname')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('message')
            .not()
            .isEmpty()
            .isLength({ min: 20, max: 350 })
            .withMessage('Make sure your message has at least 20 characters, and less then 350. Try to be brief if you can!'),
        check('recaptcha')
            .not()
            .isEmpty()
            .withMessage('Must provide a valid recaptcha response')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        const ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(req.body);

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        } else {

            var checkRecaptcha = `${grecaptcha}secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.recaptcha}&remoteip=${ipAddress}`
            Request(checkRecaptcha, function(error, resp, body) {
                body = JSON.parse(body);

                console.log(`${checkRecaptcha}`);
                console.log(body);

                if (body.success !== undefined && !body.success) {
                    return res.status(422).jsonp({"status": "error", "message": "Captcha Validation failed"});
                } else {
                    const contact = new contactSchema({
                        person: {
                            realname: req.body.realname,
                            email: req.body.email,
                            phone: req.body.phone || undefined
                        },
                        company: req.body.company || undefined,
                        message: req.body.message,
                        created: {
                            ipAddress: ipAddress,
                            createdAt: new Date().now
                        }
                    });

                    contact.save().then((response) => {
                        res.status(201).json({
                            status: "success",
                            message: "Contact request successfully created.",
                            result: response
                        });
                    }).catch(error => {
                        res.status(500).json({
                            status: "error",
                            error: error
                        });
                    });
                }
            });

        }
    })

    module.exports = router;