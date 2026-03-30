const generateCrudRoutes = require('../BaseRoutes');
const imagenAdicionalVinoController = require('../../controllers/imagenAdicionalVinoController');
const upload = require('../../middlewares/upload');

const router = generateCrudRoutes(imagenAdicionalVinoController, {
  exclude: ['create', 'update', 'updateFields']
});

router.post('/', upload.single('url_img'), imagenAdicionalVinoController.create);
router.put('/:id', upload.single('url_img'), imagenAdicionalVinoController.update);
router.patch('/:id', upload.single('url_img'), imagenAdicionalVinoController.updateFields);

module.exports = router;