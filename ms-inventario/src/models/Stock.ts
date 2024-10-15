import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Stock extends Model {
  public id!: number;
  public producto_id!: number;
  public fecha_transaccion!: Date;
  public cantidad!: number;
  public entrada_salida!: number;
}

Stock.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_transaccion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Set an integer default value
  },
  entrada_salida: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Set an integer default value, e.g., 1 for "entrada"
  },
}, {
  sequelize,
  modelName: 'Inventario',
});

export default Stock;
