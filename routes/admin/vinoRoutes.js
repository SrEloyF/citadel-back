const generateCrudRoutes = require('../BaseRoutes');
const vinoController = require('../../controllers/vinoController');
const upload = require('../../middlewares/upload'); //const multer = require('multer');

const router = generateCrudRoutes(vinoController);
router.stack = router.stack.filter(
  layer => !(layer.route && layer.route.path === '/' && layer.route.methods.post)
);
router.stack = router.stack.filter(
  layer => !(layer.route && layer.route.path === '/:id' && layer.route.methods.put)
);
router.stack = router.stack.filter(
  layer => !(layer.route && layer.route.path === '/:id' && layer.route.methods.patch)
);

router.post('/', upload.single('url_img_principal'), vinoController.create);
router.put('/:id', upload.single('url_img_principal'), vinoController.update);
router.patch('/:id', upload.single('url_img_principal'), vinoController.updateFields);

module.exports = router;
