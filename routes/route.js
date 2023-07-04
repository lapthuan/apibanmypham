const { signup, getbill } = require('../controller/appController')
const router = require('express').Router()

router.post('/user/signup', signup)
router.post('/product/getbill', getbill)

module.exports = router