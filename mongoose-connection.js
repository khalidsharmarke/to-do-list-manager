const mongoose = require('mongoose');

mongoose.connection.on('error', err => console.error(err))
mongoose.connection.once('open', () => console.log('connected to DB'))

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    _name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]
})
const User = mongoose.model('User', userSchema)

const groupSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    date_created: Date
})
const Group = mongoose.model('Group', groupSchema)

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' || 'Group',
        // ref: {
        //     type: String,
        //     enum: ['User', 'Group']
        // },
        required: true
    },
    item_type: {
        type: String,
        enum: ['meeting', 'event', 'task'],
        required: true
    },
    details: {
        last_updated: Date,
        time_event_occurs: Date,
        deadline: Date,
        recurring: Number,
        location: String,
        done: Boolean
    },
    date_created: Date
})
const Item = mongoose.model('Item', itemSchema)


module.exports = { mongoose, User, Group, Item }