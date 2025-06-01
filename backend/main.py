from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from models import Empleado, EmpleadoCreate
import psycopg2

app = FastAPI()

# CORS Config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/empleados/", response_model=Empleado)
async def crear_empleado(empleado: EmpleadoCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO empleados (nombre, apellido, email, puesto, salario, fecha_contratacion)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, nombre, apellido, email, puesto, salario, fecha_contratacion, activo
            """,
            (
                empleado.nombre,
                empleado.apellido,
                empleado.email,
                empleado.puesto,
                empleado.salario,
                empleado.fecha_contratacion,
            ),
        )
        new_empleado = cursor.fetchone()
        conn.commit()
        return new_empleado
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    finally:
        cursor.close()
        conn.close()

@app.get("/empleados/", response_model=list[Empleado])
async def leer_empleados(activo: bool = None, limit: int = 10000, offset: int = 0):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = "SELECT * FROM empleados"
        params = []
        
        if activo is not None:
            query += " WHERE activo = %s"
            params.append(activo)
        
        query += " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        empleados = cursor.fetchall()
        return empleados
    finally:
        cursor.close()
        conn.close()

# Endpoints adicionales (GET by ID, UPDATE, DELETE)...