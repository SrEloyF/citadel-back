const generateCrudRoutes = require('../BaseRoutes');
const vinoController = require('../../controllers/vinoController');
const upload = require('../../middlewares/upload');

const router = generateCrudRoutes(vinoController, {
  exclude: ['create', 'update', 'updateFields']
});

const multer_config = upload.fields([
  { name: 'url_img_principal', maxCount: 1 },
  { name: 'imagen_adicionales', maxCount: 10 }
]);

router.post('/', multer_config, vinoController.create);
router.put('/:id', multer_config, vinoController.update);
router.patch('/:id', multer_config, vinoController.updateFields);

module.exports = router;
