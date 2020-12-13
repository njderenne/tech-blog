const router = require('express').Router();
const session = require('express-session');
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');


router.get('/', (req, res) => {

    console.log(req.session);

    Post.findAll({
        attributes: [
            'id',
            'title',
            'post_url',
            'post_text',
            'created_at'
        ],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(dbPostData => {
            //pass a single post object into the homepage template
            const posts = dbPostData.map(post => post.get({ plain: true }))
            res.render('homepage', { posts });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/dashboard', (req, res) => {
    if(!req.session.loggedIn) {
        res.redirect('/login');
        return;
    }
    console.log(req.session);

    Post.findAll({
        attributes: [
            'id',
            'title',
            'post_url',
            'post_text',
            'created_at'
        ],
        where: {
            user_id:  req.session.user_id
        },
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(dbPostData => {
            //pass a single post object into the homepage template
            const posts = dbPostData.map(post => post.get({ plain: true }))
            res.render('homepage', { posts });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});











router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('login');
});

module.exports= router;