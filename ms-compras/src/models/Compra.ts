import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Compra extends Model {
  public id!: number;
  public producto_id!: number;
  public fecha_compra!: Date;
  public direccion_envio!: string;
}

Compra.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_compra: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  direccion_envio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Compra',
});

export default Compra;
