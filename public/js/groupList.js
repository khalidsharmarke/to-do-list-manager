class Groups {

    constructor(user, target, child) {
        this.user = user;
        this.target = target
        this.child = child
        this.add_join = document.createElement('button');
        this.add_join.textContent = 'Create/Join Group'
    }

    init() {
    	this.clearThis()
        this.clearActive()

        this.add_join.addEventListener('click', () => {
            while (document.getElementById('items').firstChild) {
                document.getElementById('items').firstChild.remove()
            }
            document.getElementById('groupName').textContent = 'List of Tasks per Group Name'
            this.newGroup()
        })

        this.personals = this.createItemSet({
            title: 'Personals',
            body: this.user.items,
            id: this.user._id
        })
        this.groups = this.user.groups.map(group => this.createItemSet({
            title: group.name,
            body: group.items,
            id: group._id,
            members: group.members
        }))
        this.render()
    }

    render() {
        this.target.append(this.add_join, this.personals);
        this.groups.forEach(group => this.target.appendChild(group))
    }

    displayGroup(group) {
        const placeOnPage = document.getElementById('active-selection');
        const groupContainer = document.createElement('div');
        const groupName = document.createElement('h3');
        groupName.textContent = group.name
        groupContainer.appendChild(groupName)

        group.members.forEach(member => {
            const memberContainer = document.createElement('div')
            memberContainer.textContent = member.username
            groupContainer.appendChild(memberContainer)
        })
        const searchFunc = document.getElementById('userSearch').content.querySelector('div').cloneNode(true);
        searchFunc.querySelector('button').addEventListener('click', () => {
            if (searchFunc.querySelector('input').value != '') {
                let query = new URLSearchParams()
                query.append('username', searchFunc.querySelector('input').value);

                fetch(`/getUser?${query}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            groupID: group._id
                        }),
                        headers: {
                            'Content-type': 'application/json'
                        }
                    })
                    .then(res => {
                        if (res.status == 409) {
                            alert('user already in group')
                        } else {
                            res.json()
                                .then(body => {
                                    group.members.push(body)
                                    this.clearThis()
                                    this.init()
                                    this.displayGroup(group)
                                })
                        }

                    })
            }
        })
        groupContainer.appendChild(searchFunc)
        placeOnPage.appendChild(groupContainer)
    }

    clearThis() {
        while (this.target.firstChild) {
            this.target.firstChild.remove()
        }
    }

    clearActive() {
        while (document.getElementById('active-selection').firstChild) {
            document.getElementById('active-selection').firstChild.remove()
        }
    }

    createItemSet(obj) {
        const button = document.createElement('button')
        button.textContent = obj.title
        const content = new Items(obj.id, obj.body, this.child)
        button.addEventListener('click', () => {
            this.clearActive()
            document.getElementById('groupName').textContent = obj.title
            content.init()
            if (obj.members) {
                this.displayGroup({
                    members: obj.members,
                    name: obj.title,
                    _id: obj.id
                })
            }
        })
        return button
    }

    requestGroup(obj) {
        async function makeRequest(endpoint, req_body) {
            try {
                return fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ groupName: req_body })
                    })
                    .then(res => res.json())
                    .then(json => json)
            } catch (err) {
                return err
            }
        }
        obj.create ?
            makeRequest(`/createGroup?userID=${this.user._id}`, obj.create)
            .then(res => {
                this.user.groups.push(res)
                this.init()
            })
            .catch(err => console.log(err)) :
            makeRequest(`joinGroup?userID=${this.user._id}`, obj.join)
            .then(res => {
                this.user.groups.push(res)
                this.init()
            })
            .catch(err => console.log(err))
    }

    newGroup() {
        this.clearActive()
        const baseTemplate = document.getElementById('newGroup').content.cloneNode(true)
        const placeOnPage = document.getElementById('active-selection')
        const inputTemplate = document.getElementById('groupAddition').content.cloneNode(true)
        const buttons = baseTemplate.querySelectorAll('button')

        buttons[0].addEventListener('click', () => {
            inputTemplate.querySelector('label').textContent = 'Group Name'
            inputTemplate.querySelector('button').textContent = 'Create'
            inputTemplate.querySelector('button').addEventListener('click', () => {
                this.requestGroup({ create: document.querySelector('#groupAdditionInput').value })
            })
            placeOnPage.appendChild(inputTemplate)
        })
        buttons[1].addEventListener('click', () => {
            inputTemplate.querySelector('label').textContent = 'Code'
            inputTemplate.querySelector('button').textContent = 'Join'
            inputTemplate.querySelector('button').addEventListener('click', () => {
                this.requestGroup({ join: document.querySelector('#groupAdditionInput').value })
            })
            placeOnPage.appendChild(inputTemplate)
        })

        placeOnPage.appendChild(baseTemplate)
    }
}