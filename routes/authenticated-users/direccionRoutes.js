const express = require('express');
const router = express.Router();
const direccionController = require('../../controllers/direccionController');

router.get('/', direccionController.obtenerDirecciones);
router.get('/principal', direccionController.obtenerDireccionPrincipal);
router.post('/', direccionController.crearDireccion);
router.put('/:id', direccionController.editarDireccion);
router.patch('/principal', direccionController.patchDireccionPrincipal);
router.delete('/:id', direccionController.eliminarDireccion);

module.exports = router;
