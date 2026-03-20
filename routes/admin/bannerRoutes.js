const generateCrudRoutes = require('../BaseRoutes');
const bannerController = require('../../controllers/bannerController');
const upload = require('../../middlewares/upload');

const router = generateCrudRoutes(bannerController);

router.stack = router.stack.filter(
  layer => !(layer.route && layer.route.path === '/' && layer.route.methods.post)
);
router.stack = router.stack.filter(
  layer => !(layer.route && layer.route.path === '/:id' && layer.route.methods.put)
);
router.stack = router.stack.filter(
  layer => !(layer.route && layer.route.path === '/:id' && layer.route.methods.patch)
);

router.post('/', upload.single('url_img'), bannerController.create.bind(bannerController));
router.put('/:id', upload.single('url_img'), bannerController.update.bind(bannerController));
router.patch('/:id', upload.single('url_img'), bannerController.updateFields.bind(bannerController));

router.post('/purge-expired', bannerController.purgeExpired.bind(bannerController));

module.exports = router;
