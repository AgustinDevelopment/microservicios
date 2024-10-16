import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Pago extends Model {
  public id!: number;
  public producto_id!: number;
  public precio!: number;
  public medio_pago!: string;
}

Pago.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  medio_pago: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'tarjeta',  // Puedes cambiar el valor por defecto
  },
}, {
  sequelize,
  modelName: 'Pago',  // El nombre del modelo
});

export default Pago;
