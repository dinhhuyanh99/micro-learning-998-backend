'use strict';
const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: {
		type: String,
		required: "Please provide your username!"
	}, 
	email: {
		type: String,
		required: "Please provide your email!"
	},
	password: {
		type: String,
		required: "Please provide your password!"
	},
	phoneNumber: {
		type: String,
		default: null
	},
	firstName: {
		type: String,
		required: "Please provide your first name!"
	},
	lastName: {
		type: String,
		required: "Please provide your last name!"
	},
	dateOfBirth: {
		type: Date,
		default: null
	},
	address: {
		type: String,
		default: null
	},
    countryRegion: {
		type: String,
		default: null
	},
    city: {
		type: String,
		default: null
	},
    streetProvince: {
		type: String,
		default: null
	},
    zipCode: {
		type: String,
		default: null
	},
	gender: {
		type: Number,
		enum: [0, 1, 2], // Male, Female, Prefer not to say
		default: 2,
		validate: {
			validator: function(genderInput){
				return /^[0-2]$/g.test(genderInput);
			},
			message: genderOutput => `${genderOutput.value} is not a valid gender value.`
		}
	},
	userActivities: {
		type: [{ activityDescription: { type: String }, timeOfActivtiy: { type: Date, default: Date.now() } }],
		default: []
	},
	accountStatus: {
		type: Number,
		enum: [-2, -1, 1], // Banned, Deactivated, Active
		default: 1,
		validate: {
			validator: function(accountStatusInput){
				return /^-{0,1}[1-2]$/g.test(accountStatusInput);
			},
			message: accountStatusOutput => `${accountStatusOutput.value} is not a valid accountStatus value.`
		}
	}
}, {timestamps: true});

module.exports = mongoose.model('Users', UserSchema);