const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/', usersController.createUser);
router.get('/', usersController.listUsers);
router.get('/:id', usersController.getUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;