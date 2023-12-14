const express = require('express')
const router = express.Router()
const restaurant = require('./restaurant')

router.use('/restaurants', restaurant)

module.exports = router