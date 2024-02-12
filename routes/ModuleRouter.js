const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/RoleMiddleware');
const controller = require('../controllers/ModuleController')

// router.post('/cours', roleMiddleware(['ADMIN']), controller.create);
router.post('/', controller.create);
router.delete('/:id', controller.remove);
router.get('', controller.getAll);
router.get('/:id', controller.getModule);






module.exports = router;
