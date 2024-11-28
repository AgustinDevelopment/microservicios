import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check } from 'k6';

const statusTrend = new Trend('status_codes');

export const options = {
    stages: [
        { duration: "10s", target: 10000 },
        { duration: "20s", target: 10000 },
        { duration: "10s", target: 0 },
    ],
};

export default function () {
    const BASE_URL_CATALOG = 'http://localhost:4000/api/products';
    const BASE_URL_COMPRAS = 'http://localhost:4001/api/products';
    const BASE_URL_INVENTARIO = 'http://localhost:4002/api/products';
    const BASE_URL_PAYMENTS = 'http://localhost:4003/api/products';

    const payload = JSON.stringify({ "producto_id": 8, "cantidad": 1, "entrada_salida": 1, "precio": 10.0 });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: '60s', // Aumenta el tiempo de espera
    };

    // Test endpoint for ms-catalog
    const resCatalog = http.post(`${BASE_URL_CATALOG}/productos/create`, payload, params);
    statusTrend.add(resCatalog.status);
    const catalogCheck = check(resCatalog, {
        'status is 200': (r) => r.status === 200,
    });

    // Test endpoint for ms-compras
    const resCompras = http.post(`${BASE_URL_COMPRAS}/compra/create`, payload, params);
    statusTrend.add(resCompras.status);
    const comprasCheck = check(resCompras, {
        'status is 200': (r) => r.status === 200,
    });

    // Test endpoint for ms-inventario
    const resInventario = http.put(`${BASE_URL_INVENTARIO}/stock/8`, payload, params);
    statusTrend.add(resInventario.status);
    const inventarioCheck = check(resInventario, {
        'status is 200': (r) => r.status === 200,
    });

    // Test endpoint for ms-payments
    const resPayments = http.post(`${BASE_URL_PAYMENTS}/pagos/procesar`, payload, params);
    statusTrend.add(resPayments.status);
    const paymentsCheck = check(resPayments, {
        'status is 200': (r) => r.status === 200,
    });

    if (catalogCheck && comprasCheck && inventarioCheck && paymentsCheck) {
        console.log('Todas las pruebas pasaron exitosamente.');
    } else {
        console.log('Algunas pruebas fallaron.');
    }
}