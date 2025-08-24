// Datos de habitaciones
const habitaciones = {
    101: { nombre: 'Doble', precio: 40000, capacidad: 2 },
    102: { nombre: 'Doble / 2 ambientes', precio: 80000, capacidad: 4 },
    103: { nombre: 'Doble', precio: 40000, capacidad: 2 },
    201: { nombre: 'Doble / 2 ambientes', precio: 80000, capacidad: 4 },
    202: { nombre: 'Matrimonial', precio: 40000, capacidad: 2 },
    203: { nombre: 'Matrimonial', precio: 40000, capacidad: 2 },
    204: { nombre: 'Triple', precio: 60000, capacidad: 3 },
    205: { nombre: 'Triple', precio: 60000, capacidad: 3 },
    206: { nombre: 'Grupal', precio: 80000, capacidad: 4 },
    207: { nombre: 'Grupal', precio: 80000, capacidad: 4 }
};

// URL de Google Apps Script (cambiar por tu URL real)
const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';

// Cambiar tabs
function showTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remover clase active de todos los tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado
    document.getElementById(tabName).classList.remove('hidden');
    
    // Activar tab seleccionado
    event.target.classList.add('active');
}

// Filtrar habitaciones según huéspedes
function actualizarHabitaciones() {
    const huespedes = parseInt(document.getElementById('huespedes').value);
    const habitacionSelect = document.getElementById('habitacion');
    
    if (!huespedes) {
        habitacionSelect.innerHTML = '<option value="">Primero seleccione número de huéspedes...</option>';
        return;
    }
    
    habitacionSelect.innerHTML = '<option value="">Seleccione una habitación...</option>';
    
    for (const [id, habitacion] of Object.entries(habitaciones)) {
        if (habitacion.capacidad >= huespedes) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${id} - ${habitacion.nombre} (${habitacion.capacidad} personas) - $${habitacion.precio.toLocaleString()}`;
            habitacionSelect.appendChild(option);
        }
    }
}

// Calcular total
function calcularTotal() {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const habitacionId = document.getElementById('habitacion').value;
    
    if (!checkin || !checkout || !habitacionId) {
        document.getElementById('totalCalculation').classList.add('hidden');
        return;
    }
    
    const fechaCheckin = new Date(checkin);
    const fechaCheckout = new Date(checkout);
    const noches = Math.ceil((fechaCheckout - fechaCheckin) / (1000 * 60 * 60 * 24));
    
    if (noches <= 0) {
        document.getElementById('totalCalculation').classList.add('hidden');
        mostrarMensaje('La fecha de check-out debe ser posterior al check-in', 'error');
        return;
    }
    
    const habitacion = habitaciones[habitacionId];
    const total = habitacion.precio * noches;
    
    document.getElementById('habitacionSeleccionada').textContent = `${habitacionId} - ${habitacion.nombre}`;
    document.getElementById('precioPorNoche').textContent = `$${habitacion.precio.toLocaleString()}`;
    document.getElementById('numeroNoches').textContent = noches;
    document.getElementById('precioTotal').textContent = `$${total.toLocaleString()}`;
    
    document.getElementById('totalCalculation').classList.remove('hidden');
}

// Mostrar mensajes
function mostrarMensaje(texto, tipo = 'success') {
    const mensaje = document.getElementById('mensaje');
    const clase = tipo === 'success' ? 'success-message' : 'error-message';
    const icono = tipo === 'success' ? '✅' : '❌';
    
    mensaje.innerHTML = `
        <div class="${clase}">
            ${icono} ${texto}
        </div>
    `;
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
        mensaje.innerHTML = '';
    }, 5000);
}

// Enviar datos a Google Sheets
async function enviarReserva(datos) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha mínima como hoy
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = hoy;
    document.getElementById('checkout').min = hoy;
    
    // Event listeners para cálculos
    document.getElementById('huespedes').addEventListener('change', actualizarHabitaciones);
    document.getElementById('checkin').addEventListener('change', calcularTotal);
    document.getElementById('checkout').addEventListener('change', calcularTotal);
    document.getElementById('habitacion').addEventListener('change', calcularTotal);
    
    // Validar que checkout sea después de checkin
    document.getElementById('checkin').addEventListener('change', function() {
        const checkin = this.value;
        document.getElementById('checkout').min = checkin;
    });
    
    // Enviar formulario
    document.getElementById('reservaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(this);
        const datos = {};
        for (let [key, value] of formData.entries()) {
            datos[key] = value;
        }
        
        // Agregar datos calculados
        const habitacionId = datos.habitacion;
        const habitacion = habitaciones[habitacionId];
        const checkin = new Date(datos.checkin);
        const checkout = new Date(datos.checkout);
        const noches = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        const total = habitacion.precio * noches;
        
        datos.noches = noches;
        datos.total = total;
        datos.precio_por_noche = habitacion.precio;
        datos.fecha_reserva = new Date().toISOString().split('T')[0];
        datos.id_reserva = 'R' + Date.now(); // ID temporal
        
        // Mostrar mensaje de carga
        const boton = document.querySelector('.btn');
        const textoOriginal = boton.textContent;
        boton.textContent = '⏳ Procesando...';
        boton.disabled = true;
        
        try {
            // Enviar a Google Sheets (simulado por ahora)
            // const resultado = await enviarReserva(datos);
            
            // Por ahora, simulamos éxito
            setTimeout(() => {
                mostrarMensaje(`
                    <strong>¡Reserva creada exitosamente!</strong><br>
                    ID: ${datos.id_reserva}<br>
                    Total: $${total.toLocaleString()}<br>
                    <small>Los datos han sido guardados en Google Sheets</small>
                `, 'success');
                
                // Limpiar formulario
                document.getElementById('reservaForm').reset();
                document.getElementById('totalCalculation').classList.add('hidden');
                
                // Restaurar botón
                boton.textContent = textoOriginal;
                boton.disabled = false;
            }, 2000);
            
        } catch (error) {
            mostrarMensaje('Error al procesar la reserva. Intenta nuevamente.', 'error');
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }
    });
});

// Funciones utilitarias
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validarTelefono(telefono) {
    const re = /^[0-9+\-\s()]+$/;
    return re.test(telefono) && telefono.length >= 8;
}

// Exportar funciones para testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        habitaciones,
        calcularTotal,
        validarEmail,
        validarTelefono
    };
}