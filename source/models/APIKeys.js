'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var KeySchema = new Schema({
	key: {
		type: String,
		default: generateKey()
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	expiredOn: {
		type: Date
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	}
});

KeySchema.pre('save', function(){
	var expiredOnDate = new Date(this.createdAt);
	expiredOnDate.setDate(new Date(this.createdAt).getDate() + 14);
	this.expiredOn = expiredOnDate;
});


function generateKey(){
	var stringKey = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var endKey = "";
	for(var currentLength = 0; currentLength < 32; currentLength++){
		endKey += stringKey.charAt(Math.floor(Math.random() * (+62 - +0)) + +0);
	}
	return endKey;
}

module.exports = mongoose.model('Keys', KeySchema);