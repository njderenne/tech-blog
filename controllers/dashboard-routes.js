const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');



router.get('/', withAuth, (req, res) => {
    // if(!req.session.loggedIn) {
    //     res.redirect('/login');
    //     return;
    // }
    // console.log(req.session);

    Post.findAll({
        where: {
            user_id:  req.session.user_id
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
            res.render('dashboard', { posts, loggedIn: true });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/edit/:id', withAuth, (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id,
        },
        attributes: [
            'id',
            'post_url',
            'title',
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
            if(!dbPostData) {
                res.status(404).json({ message: 'No post found with this id '});
                return;
            }

            //serialize the data
            const post = dbPostData.get({ plain: true });

            //pass data to template
            res.render('edit-post', { 
                post,
                loggedIn: true
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports= router;