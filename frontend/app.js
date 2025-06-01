const API_URL = "http://localhost:8000"; // Cambiar según tu configuración

let currentPage = 1;
const itemsPerPage = 20;

document.addEventListener('DOMContentLoaded', () => {
    loadEmpleados();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('empleadoForm').addEventListener('submit', handleSubmit);
    document.getElementById('activosCheck').addEventListener('change', () => {
        currentPage = 1;
        loadEmpleados();
    });
    document.getElementById('searchInput').addEventListener('input', debounce(loadEmpleados, 300));
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadEmpleados();
        }
    });
    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        loadEmpleados();
    });
}

async function loadEmpleados() {
    const activos = document.getElementById('activosCheck').checked;
    const searchTerm = document.getElementById('searchInput').value;
    
    let url = `${API_URL}/empleados/?activo=${activos}&limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`;
    
    if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    try {
        const response = await fetch(url);
        const empleados = await response.json();
        renderEmpleados(empleados);
        updatePaginationInfo();
    } catch (error) {
        console.error("Error cargando empleados:", error);
        alert("Error al cargar empleados");
    }
}

function renderEmpleados(empleados) {
    const tbody = document.querySelector('#empleadosTable tbody');
    tbody.innerHTML = '';

    empleados.forEach(empleado => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${empleado.id}</td>
            <td>${empleado.nombre}</td>
            <td>${empleado.apellido}</td>
            <td>${empleado.email}</td>
            <td>${empleado.puesto || '-'}</td>
            <td>${empleado.salario ? '$' + empleado.salario.toLocaleString() : '-'}</td>
            <td>
                <button class="btn-edit" data-id="${empleado.id}">Editar</button>
                <button class="btn-delete" data-id="${empleado.id}">Eliminar</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            editEmpleado(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteEmpleado(id);
        });
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const empleado = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        puesto: document.getElementById('puesto').value || null,
        salario: document.getElementById('salario').value ? parseFloat(document.getElementById('salario').value) : null,
        fecha_contratacion: document.getElementById('fecha').value || null
    };

    try {
        const response = await fetch(`${API_URL}/empleados/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empleado)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al registrar empleado');
        }

        alert('Empleado registrado con éxito');
        document.getElementById('empleadoForm').reset();
        loadEmpleados();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

// Funciones para editar y eliminar (implementar similar a handleSubmit)
// ...

function updatePaginationInfo() {
    document.getElementById('pageInfo').textContent = `Página ${currentPage}`;
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}