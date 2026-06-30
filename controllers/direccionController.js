const { Direccion, sequelize } = require('../models');

const obtenerDirecciones = async (req, res, next) => {
  try {
    const id_usuario = req.user.id;
    const direcciones = await Direccion.findAll({
      where: { id_usuario },
      order: [['id_direccion', 'DESC']]
    });
    res.json(direcciones);
  } catch (error) {
    next(error);
  }
};

const obtenerDireccionPrincipal = async (req, res, next) => {
  try {
    const id_usuario = req.user.id;
    const direccion = await Direccion.findOne({
      where: { id_usuario, principal: true }
    });
    
    if (!direccion) {
      return res.status(404).json({ error: 'No se encontró una dirección principal' });
    }
    
    res.json(direccion);
  } catch (error) {
    next(error);
  }
};

const crearDireccion = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.user.id;
    const { id_departamento, id_provincia, id_distrito, calle, numero, cp, principal } = req.body;

    let esPrincipal = true;
    if (principal !== undefined) {
       esPrincipal = principal;
    }

    if (esPrincipal) {
      await Direccion.update(
        { principal: false },
        { where: { id_usuario, principal: true }, transaction: t }
      );
    } else {
      const existePrincipal = await Direccion.findOne({ where: { id_usuario, principal: true }, transaction: t });
      if (!existePrincipal) {
        esPrincipal = true;
      }
    }

    const nuevaDireccion = await Direccion.create({
      id_usuario,
      id_departamento,
      id_provincia,
      id_distrito,
      calle,
      numero,
      cp,
      principal: esPrincipal
    }, { transaction: t });

    await t.commit();
    res.status(201).json(nuevaDireccion);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const editarDireccion = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.user.id;
    const id_direccion = req.params.id;
    const data = req.body;

    const direccionAntigua = await Direccion.findOne({
      where: { id_direccion, id_usuario },
      transaction: t
    });

    if (!direccionAntigua) {
      await t.rollback();
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    await direccionAntigua.update({ principal: false }, { transaction: t });

    let seráPrincipal = direccionAntigua.principal;
    if (data.principal !== undefined) {
      seráPrincipal = data.principal;
    }

    if (seráPrincipal) {
      await Direccion.update(
        { principal: false },
        { where: { id_usuario, principal: true }, transaction: t }
      );
    } else {
       const hayOtra = await Direccion.findOne({ where: { id_usuario, principal: true }, transaction: t });
       if (!hayOtra) seráPrincipal = true;
    }

    const nuevaDireccion = await Direccion.create({
      id_usuario,
      id_departamento: data.id_departamento !== undefined ? data.id_departamento : direccionAntigua.id_departamento,
      id_provincia: data.id_provincia !== undefined ? data.id_provincia : direccionAntigua.id_provincia,
      id_distrito: data.id_distrito !== undefined ? data.id_distrito : direccionAntigua.id_distrito,
      calle: data.calle !== undefined ? data.calle : direccionAntigua.calle,
      numero: data.numero !== undefined ? data.numero : direccionAntigua.numero,
      cp: data.cp !== undefined ? data.cp : direccionAntigua.cp,
      principal: seráPrincipal
    }, { transaction: t });

    await t.commit();
    res.json(nuevaDireccion);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const eliminarDireccion = async (req, res, next) => {
  try {
    const id_usuario = req.user.id;
    const id_direccion = req.params.id;

    const direccion = await Direccion.findOne({ where: { id_direccion, id_usuario } });
    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    await direccion.update({ principal: false });
    res.json({ message: 'Dirección eliminada correctamente (ocultada)' });
  } catch (error) {
    next(error);
  }
};

const patchDireccionPrincipal = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.user.id;
    const data = req.body;

    const direccionAntigua = await Direccion.findOne({
      where: { id_usuario, principal: true },
      transaction: t
    });

    if (!direccionAntigua) {
      await t.rollback();
      return res.status(404).json({ error: 'No se encontró una dirección principal para actualizar' });
    }

    await direccionAntigua.update({ principal: false }, { transaction: t });

    const nuevaDireccion = await Direccion.create({
      id_usuario,
      id_departamento: data.id_departamento !== undefined ? data.id_departamento : direccionAntigua.id_departamento,
      id_provincia: data.id_provincia !== undefined ? data.id_provincia : direccionAntigua.id_provincia,
      id_distrito: data.id_distrito !== undefined ? data.id_distrito : direccionAntigua.id_distrito,
      calle: data.calle !== undefined ? data.calle : direccionAntigua.calle,
      numero: data.numero !== undefined ? data.numero : direccionAntigua.numero,
      cp: data.cp !== undefined ? data.cp : direccionAntigua.cp,
      principal: true
    }, { transaction: t });

    await t.commit();
    res.json(nuevaDireccion);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  obtenerDirecciones,
  obtenerDireccionPrincipal,
  crearDireccion,
  editarDireccion,
  eliminarDireccion,
  patchDireccionPrincipal
};
