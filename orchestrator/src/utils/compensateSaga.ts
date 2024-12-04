import axios from "axios";

const compensateSaga = async(paymentId: number, purchase_id: number, product_id: number, cantidad:number) => {

    try {
        // Primero, intenta revertir el pago
        const paymentResponse = await axios.delete(`http://localhost:4003/api/products/${paymentId}`);
        if (paymentResponse.status !== 200) {
          throw new Error('Error al revertir el pago');
        }
    
        // Luego, intenta revertir el inventario
        const inventoryResponse = await axios.put(`http://localhost:4002/api/products/revert/${product_id}`, { cantidad });
        if (inventoryResponse.status !== 200) {
          throw new Error('Error al revertir el inventario');
        }
    
        // Finalmente, intenta revertir la compra
        const purchaseResponse = await axios.delete(`http://localhost:4001/api/products/${purchase_id}`);
        if (purchaseResponse.status !== 200) {
          throw new Error('Error al revertir la compra');
        }
    
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error en la saga de compensación:', error.message);
        } else {
          console.error('Error en la saga de compensación:', error);
        }
        throw error; // Re-lanzar el error para que la lógica de compensación falle
      }

}

export default compensateSaga