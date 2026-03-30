const generateCrudRoutes = require('../BaseRoutes');
const vinoController = require('../../controllers/vinoController');
const upload = require('../../middlewares/upload');

const router = generateCrudRoutes(vinoController, {
  exclude: ['create', 'update', 'updateFields']
});

router.post('/', upload.single('url_img_principal'), vinoController.create);
router.put('/:id', upload.single('url_img_principal'), vinoController.update);
router.patch('/:id', upload.single('url_img_principal'), vinoController.updateFields);

module.exports = router;
