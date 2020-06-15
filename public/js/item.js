class Item {
	constructor(task){
	this.body = document.createElement('button');
	this.title = task.title;
	this.notes = task.notes;
	this.item_type = task.item_type;
	this.status = task.details.done;
	}
	init(){
		this.body.textContent = this.title;
	}
	edit(property, new_value){
		this[property] = new_value;
	}
}