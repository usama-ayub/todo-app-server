const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const randomstring = require("randomstring");
const mime = require('mime-types');
cors = require('cors');
const app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://admin:admin@ds129610.mlab.com:29610/test-db');

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ');
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

const User = require('./app/model/user');
const Todo = require('./app/model/todo');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 3000;


const router = express.Router();

router.use(function (req, res, next) {
    next();
});


router.route('/')
    .get((req, res) => {
        res.json({message: 'hooray! welcome to our api!'});
    });

router.route('/register')
    .post((req, res) => {
        let body = req.body;
        let {firstName, lastName, email, password, userName} = body;
        let user = new User(body);
        user.save((err) => {
            if (err) {
                return res.send(err);
            } else {
                res.status(200).json({message: 'User Created!'});
            }
        });
    });

router.route('/login')
    .post((req, res, next) => {
        let body = req.body;
        let {email, password} = body;
        User.findOne({email: body.email}, (err, user) => {
            if (err) return next(err);
            if (!user) return res.status(404).json({msg: 'Email is invalid'});
            user.comparePassword(body.password, (err, isMatch) => {
                if (err) return next(err);
                if (!isMatch) return res.status(404).json({message: 'Password is invalid'});
                res.status(200).json({
                    data: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        profilePic: user.profilePic,
                        userName: user.userName
                    }, message: 'login successfully'
                });
            });
        });
    });

router.route('/social')
    .post((req, res) => {
        User.findOne({socialID: req.body.socialID}, (err, user) => {
            if (err) {
                let body = req.body;
                let {firstName, lastName, email, password, userName, profilePic, socialID} = body;
                let user = new User(body);
                user.save((err, user) => {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.status(200).json({
                            data: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                profilePic: user.profilePic,
                                userName: user.userName
                            }, message: 'User created!'
                        });
                    }
                });
            }
            else {
                res.status(200).json({
                    data: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        profilePic: user.profilePic,
                        userName: user.userName
                    }, message: 'User Get Success'
                });
            }

        });
    });

router.route('/users')
    .get((req, res) => {
        User.find({}, (err, users) => {
            if (err) {
                return res.status(400).json({message: 'Users Not Found'})
            }
            res.status(200).json({message: 'Users Found', data: users})
        })
    });

router.route('/users/:user_id')
    .get((req, res) => {
        let user_id = req.params;
        User.findById(user_id, (err, user) => {
            if (err) {
                return res.status(400).json({message: 'User Not Found'})
            }
            res.status(200).json({message: 'User Found', data: user})
        })
    });


router.route('/user/todo')
 .post((req, res) => {
        let body = req.body;
        let {todoTask, CreateBy, isfavourite} = body;
        let todo = new Todo(body);
        todo.save((err) => {
            if (err) {
                return res.send(err);
            } else {
                res.status(200).json({message: 'Todo Add!'});
            }
        });
    });

router.route('/user/:user_id/todo')
    .get((req, res) => {
        let params = req.params;
        let {user_id} = params;
        let data = {
            CreateBy: user_id
        };
            Todo.find(data, (err, todo) => {
            if (err) {
                return res.status(400).json({message: 'Todo Not Found'})
            }
            res.status(200).json({message: 'Todo Found', data: todo})
        })
    });

router.route('/user/:user_id/todo/:todo_id')
    .get((req, res) => {
        let params = req.params;
        let {user_id, todo_id} = params;
        let data = {
            CreateBy: user_id,
            _id: todo_id
        };
        Todo.find(data, (err, todo) => {
            if (err) {
                return res.status(400).json({message: 'Todo Not Found'})
            }
           else{
               return res.status(200).json({message: 'Todo Found',data:todo})
           }
        })
    });

router.route('/user/todo/favourite')
    .post((req, res) => {
        let body = req.body;
        let {user_id, todo_id, favourite} = body;
       
        Todo.findByIdAndUpdate({_id:body.todo_id},{isfavourite:body.favourite }, (err, result) => {
            if (err) {
                return res.status(400).json({message: 'Todo Not Found'})
            }
           else{
               return res.status(200).json({message: 'Add in favourite'})
           }
        })
    });


router.route('/user/:user_id/todo/:todo_id')
    .delete((req, res) => {
        let params = req.params;
        let {user_id, todo_id} = params;
        let data = {
            CreateBy: user_id,
            _id: todo_id
        };
        Todo.findByIdAndRemove(data, (err, result) => {
            if (err) {
                return res.status(400).send({message: 'Error'})
            }
            else {
                return res.status(200).send({message: 'Remove Successfully'})
            }
        })
    });

router.route('/user/todo/update')
    .put((req, res) => {
        let body = req.body;
        let {todo_id,todoTask} = body;
      
        Todo.findByIdAndUpdate({_id:body.todo_id},{todoTask:body.todoTask},(err, result) => {
            if (err) {
                return res.status(400).send({message: 'Error'})
            }
            else {
                return res.status(200).send({message: 'Update Successfully'})
            }
        })
    });














app.use('/api', router);


app.listen(port);
console.log('Server Running ' + port);
