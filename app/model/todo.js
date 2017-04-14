const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

const TodoSchema  = new Schema({
    todoTask:String,
    isfavourite:Boolean,
    CreateBy: {type:Schema.Types.ObjectId, ref: 'User'},
    CreateAt: {
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Todo', TodoSchema);