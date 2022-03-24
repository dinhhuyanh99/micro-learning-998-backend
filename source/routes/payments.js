'use strict';

const express = require('express'),
    paymentsController = require('../controllers/payments'),
    { Router } = express,
    paymentsRouter = Router();

paymentsRouter.get('/getDetails', paymentsController.showPaymentDetails);
paymentsRouter.post('/addDetails', paymentsController.addPaymentDetails);
paymentsRouter.delete('/removeDetails', paymentsController.removePaymentDetails);

module.exports = paymentsRouter;