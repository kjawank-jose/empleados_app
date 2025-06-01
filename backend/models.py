from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class EmpleadoBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    puesto: Optional[str] = None
    salario: Optional[float] = None
    fecha_contratacion: Optional[date] = None

class EmpleadoCreate(EmpleadoBase):
    pass

class Empleado(EmpleadoBase):
    id: int
    activo: bool

    class Config:
        orm_mode = True