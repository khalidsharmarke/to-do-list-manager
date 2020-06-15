class Items {
    constructor(id, data, target) {
        this.id = id
        this.datalist = data
        this.target = target
        this.listOfButtons;
    }

    init() {
        const addItemButton = this.createButton({ title: 'Add Item' })
        this.listOfButtons = this.datalist.map(item => this.createButton(item))
        this.listOfButtons.unshift(addItemButton)
        this.render()
    }
    handleResponse(item) {
        if (item.old) {			
			this.datalist[this.datalist.findIndex(entry => entry._id === item.old._id)] = item.new
        } else{
        	this.datalist.push(item.new)
        }
		this.init()
    }

    makeRequest(item) {
        function options(owner_id) {
            if (item.old) {
                return {
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'PATCH',
                    body: JSON.stringify(item)
                }
            } else {
                return {
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        ownerID: owner_id,
                        item: item.new
                    })
                }
            }
        }
        fetch(location.pathname, options(this.id))
            .then(response => {
                if (response.status == 200) {
                    this.handleResponse(item)
                } else {
                    alert('server unable to handle request')
                }
            })
            .catch(err => console.log(err))
    }

    createButton(item) {
        const button = document.createElement('button');
        button.textContent = item.title

        item._id ?
            button.addEventListener('click', () => {
                const itemInList = this.datalist.find(entry => item._id == entry._id);
                this.clearActive()
                this.createForm(itemInList)
            }) :
            button.addEventListener('click', () => {
            	this.clearActive()
                this.createForm()
            })

        return button
    }

    createForm(item) {
        let form = document.getElementById('item-form-template').content.querySelector('form').cloneNode(true);
        const placeOnPage = document.getElementById('active-selection');

        function getFormEntries() {
            return {
                title: form.querySelector('#title').value,
                item_type: form.querySelector('#item_type').value,
                notes: form.querySelector('#notes').value,
                details: {
                    done: form.querySelector('#done').checked

                }
            }
        }
        if (item) {
            form.querySelector('h4').textContent = 'Edit Item'
            form.querySelector('#title').value = item.title
            form.querySelector('#item_type').value = item.item_type;
            form.querySelector('#notes').value = item.notes;
            form.querySelector('#done').checked = item.details.done
            form.querySelector('button').addEventListener('click', (e) => {
                e.preventDefault();
                this.makeRequest({
                    old: item,
                    new: getFormEntries()
                })
            })
        } else {
            form.querySelector('h4').textContent = 'New Item';
            form.querySelector('button').addEventListener('click', (e) => {
                e.preventDefault();
                this.makeRequest({
                    old: item,
                    new: getFormEntries()
                })
            })
        }

        // placeOnPage.firstChild.remove()
        placeOnPage.appendChild(form)
    }

    clearActive(){
    	while(document.getElementById('active-selection').firstChild){
    		document.getElementById('active-selection').firstChild.remove()
    	}
    }

    render() {
        while (this.target.firstChild) {
            this.target.firstChild.remove()
        }
        this.listOfButtons.forEach(item => this.target.appendChild(item))
    }
}