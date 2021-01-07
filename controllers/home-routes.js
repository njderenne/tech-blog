const router = require('express').Router();
const session = require('express-session');
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');


router.get('/', (req, res) => {

    if(!req.session.loggedIn) {
        res.redirect('/login');
        return;
    }

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
            res.render('homepage', { 
                posts,
                loggedIn: req.session.loggedIn 
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/post/:id', (req, res) => {
    // if(!req.session.loggedIn) {
    //     res.redirect('/login');
    //     return;
    // }
    // console.log(req.session);

    Post.findOne({
        where: {
            id: req.params.id
        },
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
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(dbPostData => {
            if(!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            //res.json(dbPostData);
            //const posts = dbPostData.get({ plain: true });
            const post = dbPostData.get({ plain: true });
            res.render('single-post', {
                post,
                loggedIn: req.session.loggedIn
            });
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