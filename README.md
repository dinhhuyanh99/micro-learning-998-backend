# A Micro Learning Service - CSIT998

Micro learning is defined as any type of learning activity that is carried out within a very short time span;
these learning activities can range from a few seconds to no more than 15 minutes.
The literature behind these definitions, dives deeper into the way the human brain works, understanding that recent
advances in technology have impacted length of time that a person can focus and absorb information.  The trend has shifted
to shorter bursts of information, these can be fleeting moments of rich information to a maximum of 15 minutes before the brain
loses interest.  There is a need to provide a platform that can service these requirements, allowing the creators of learning
content upload various forms of learning materials that can be digested in short time frames. Based on this our project is focused
on creating said platform – termed ‘Micro Learning Resource Platform’ – aiming to design a user interface, back end and database
procedures to update the related tables.   

This system is consisted of 2 parts for ease of maintenance and incremental updates. This repository is for the backend
The API service is hosted at ``` <to be decided> ```

## Dependencies

* [Node.js](https://nodejs.org/) - evented I/O for the backend
* [cors](https://www.npmjs.com/package/cors) - a node.js package to provide option to enable CORS
* [express](http://expressjs.com) - fast node.js network app framework [@tjholowaychuk]
* [mongoose](https://www.npmjs.com/package/mongoose) - a [MongoDB](https://www.mongodb.com/) object modeling tool designed to work in an asynchronous environment
* [body-parser](https://www.npmjs.com/package/body-parser) - a parsing middleware that helps with translating the URL into usable format
* [nodemon](https://www.npmjs.com/package/nodemon) - a node.js package that helps with debugging node.js app
* [Cloudinary API](https://https://cloudinary.com) - an API that can help us upload photos to it for the learning contents
* [Heroku](https://devcenter.heroku.com) - a hosting service that can help us host the API of the backend
* [MongoDB Atlas](https://cloud.mongodb.com) - a MongoDB database service that will contain all of our information being sent through the API
* [Google Cloud SDK](https://cloud.google.com/sdk/) - a SDK pack that has the option for us to host a website on Google Cloud Platform


## Installation
### Backend
This API requires [Node.js](https://nodejs.org/) v10+ to run.

The list of the following steps to get the backend up and running is as follows:
1. Make sure you have a version of Node.js that is version 10 or later installed on your local machine
2. Clone this repository with ```git clone https://github.com/dinhhuyanh99/micro-learning-998-backend.git```
3. Open up a terminal in the newly cloned repository and type the following for the installation of dependencies
```sh
$ npm install
```
4. After all dependencies are installed, run the backend locally with the following command
```sh
$ npm run start_dev
```
OR
```sh
$ npm run start
```
5. After that, the service is hosted at ```localhost:8080```

### License
----

MIT



