module.exports = {
  Carrito: {
    type: 'direct',
    field: 'id_usuario',
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
      whereField: 'id_usuario',
    },
    create: {
      foreignKey: 'id_pedido'
    }
  },
};
