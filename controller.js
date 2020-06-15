const router = require('express').Router();

router.get('/', (req, res) => {
    res.redirect('/login');
})

// before showing form,
// check if authenticated.
router.get('/login', (req, res) => {
    // if (can auth) {
    //  the object passed in can be made a module.
    //  function that will return from db given user info
    //  res.render('userPage', auth) 
    // }
    res.sendFile(`${__dirname}/public/html/sign-in.html`);
})

router.post('/login', async (req, res) => {
    try {
        db.User
            .findOne({ username: req.body.username })
            .then(user => {
                if (user == null) {
                    res.status(400).send('no one by that username')
                }
                encrypt.compare(req.body.password, user.password, (err, result) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    if (result) {
                        res.redirect(`/${req.body.username}`)
                    } else {
                        res.status(400).send('wrong password')
                    }
                })
            })
    } catch (err) {
        res.status(500).send(err)
    }
})

router.get('/register', (req, res) => {
    res.sendFile(`${__dirname}/public/html/sign-up.html`)
})

router.post('/register', async (req, res) => {
    try {
        await new db.User({
            _name: req.body._name,
            username: req.body.username,
            password: await encryptPass(req.body.password)
        }).save()

        res.redirect('/login')
    } catch (err) {
        console.log(err)
        res.end()
    }
})

router.post('/getUser', (req, res) => {
    // console.log('here',req.body, req.query)
    db.User
        .findOne(req.query)
        .then(user => {
            if (user) {
                console.log(user)
                if (user.groups.includes(req.body.groupID)) {
                    res.status(409).end()
                } else {
                    db.Group
                        .findById(req.body.groupID)
                        .then(group => {
                            group.members.push(user._id)
                            user.groups.push(req.body.groupID)
                            try {
                                group.save()
                                user.save()
                                    .then(group_member => res.send(group_member))
                            } catch (err) {
                                res.status(500).send(err)
                            }
                        })
                }
            }
        })
})

router.post('/createGroup', (req, res) => {
    try {
        new db.Group({
                created_by: req.query.userID,
                name: req.body.groupName,
                members: [req.query.userID],
                date_created: new Date().toDateString()
            })
            .save()
            .then((group) => db.User
                .findById(req.query.userID)
                .then((user) => {
                    user.groups.push(group._id)
                    user.save()
                        .then(() => res.json(group))
                })
            )
    } catch (err) {
        res.send(err)
    }
})

router.get('/:username', (req, res) => {
    db.User
        .findOne({ username: req.params.username })
        .populate('items')
        .populate({
            path: 'groups',
            populate: 'items members'
        })
        .exec((err, user) => {
            if (user == null) {
                res.redirect('/login')
                return
            }
            res.render('userPage', { user: user });
        })
})

async function findOwnerById(id) {
    const foundUser = await db.User.findById(id)
        .catch(err => err)
    if (foundUser) {
        return foundUser
    } else {
        return db.Group.findById(id)
    }
}

router.post('/:username', (req, res) => {
    findOwnerById(req.body.ownerID)
        .then(owner => {
            try {
                new db.Item({
                        owner: owner._id,
                        title: req.body.item.title,
                        item_type: req.body.item.item_type,
                        notes: req.body.item.notes,
                        details: {
                            done: req.body.item.details.done
                        }
                    })
                    .save()
                    .then(item => {
                        owner.items.push(item._id)
                        owner.save()
                        .then(() => res.end())
                    })
            } catch (err) {
                res.send(err)
            }
        })

})

router.patch('/:username', (req, res) => {
    db.Item
        .findByIdAndUpdate(req.body.old._id, req.body.new, { new: true })
        .then(res => res.end(res))
        .catch(err => res.end(err))
})

let db;
let encrypt

async function encryptPass(pass_word) {
    return encrypt.hash(pass_word, parseInt(process.env.NUM_OF_HASHES))
        .then(hashed => hashed)
        .catch(err => err)
}

function config(models, encryptor) {
    if (!models) return new Error('no models were passed to controller')
    if (!encryptor) return new Error('no encryption function was passed to controller')

    db = { ...models }
    encrypt = encryptor
    return router
}

module.exports = { config: (models, encryptor) => config(models, encryptor) }