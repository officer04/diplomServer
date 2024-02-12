const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/RoleMiddleware');
const controller = require('./../controllers/coursController')

// router.post('/cours', roleMiddleware(['ADMIN']), controller.create);
router.post('/', controller.create);
router.delete('/:id', controller.remove);
router.get('', authMiddleware, controller.getAll);
router.get('/:id', controller.getCours);






module.exports = router;
