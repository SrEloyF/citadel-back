module.exports = {
  Carrito: {
    type: 'join',
    include: {
      model: 'Direccion',
      as: 'direccion',
      whereField: 'id_usuario'
    },
    create: {
      foreignKey: 'id_direccion'
    }
  },

  Usuario: {
    type: 'direct',
    field: 'id_usuario',
  },

  Pago: {
    type: 'join',
    include: {
      model: 'Carrito',
      whereField: 'id_usuario'
    },
    create: {
      foreignKey: 'id_pedido'
    }
  },

  CarritoProducto: {
    type: 'join',
    include: {
      model: 'Carrito',
      as: 'carrito',
      whereField: 'id_usuario',
      include: [
        {
          model: 'Direccion',
          as: 'direccion'
        }
      ]
    },
    create: {
      foreignKey: 'id_carrito'
    }
  },
};
