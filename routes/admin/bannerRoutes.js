const generateCrudRoutes = require('../BaseRoutes');
const bannerController = require('../../controllers/bannerController');
const upload = require('../../middlewares/upload');

const router = generateCrudRoutes(bannerController, {
  exclude: ['create', 'update', 'updateFields']
});

router.post('/', upload.single('url_img'), bannerController.create);
router.put('/:id', upload.single('url_img'), bannerController.update);
router.patch('/:id', upload.single('url_img'), bannerController.updateFields);

router.post('/purge-expired', bannerController.purgeExpired.bind(bannerController));

module.exports = router;
