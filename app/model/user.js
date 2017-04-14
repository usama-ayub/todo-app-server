const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    userName: String,
    password: String,
    createTime: {
        type: Date,
        default: Date.now
    },
    socialId: String
});

UserSchema.pre('save', function (next) {
    let user = this;

    if (!user.isModified('password')) return next();
    let hash = bcrypt.hashSync(user.password, 5);
    user.password = hash;
    next();
});


UserSchema.methods.comparePassword = function (password, cb) {
        let isMatch = bcrypt.compareSync(password, this.password)
        return cb(null, isMatch)
};


module.exports = mongoose.model('User', UserSchema);