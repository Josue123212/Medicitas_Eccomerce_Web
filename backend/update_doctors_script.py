from apps.doctors.models import Doctor
from datetime import time

# Verificar doctores existentes
doctors = Doctor.objects.all()
print('Doctores existentes:')
for d in doctors:
    print(f'ID: {d.id}, Dr. {d.user.get_full_name()}, Especialidad: {d.specialization}')

# Actualizar especialidades y horarios
updates = [
    {'id': 14, 'specialization': 'Oftalmología', 'work_start_time': time(9, 0), 'work_end_time': time(17, 0)},
    {'id': 10, 'specialization': 'Traumatología', 'work_start_time': time(8, 0), 'work_end_time': time(16, 0)},
    {'id': 12, 'specialization': 'Medicina General', 'work_start_time': time(9, 0), 'work_end_time': time(18, 0)},
    {'id': 13, 'specialization': 'Cardiología', 'work_start_time': time(10, 0), 'work_end_time': time(17, 0)},
    {'id': 11, 'specialization': 'Medicina General', 'work_start_time': time(8, 30), 'work_end_time': time(16, 30)},
]

print('\nActualizando doctores...')
for update in updates:
    try:
        doctor = Doctor.objects.get(id=update['id'])
        doctor.specialization = update['specialization']
        doctor.work_start_time = update['work_start_time']
        doctor.work_end_time = update['work_end_time']
        doctor.work_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        doctor.save()
        print(f'Actualizado: Dr. {doctor.user.get_full_name()} - {doctor.specialization}')
    except Doctor.DoesNotExist:
        print(f'Doctor con ID {update["id"]} no encontrado')

print('\nDoctores finales:')
doctors = Doctor.objects.all()
for d in doctors:
    print(f'- Dr. {d.user.get_full_name()} ({d.specialization})')
    print(f'  Horario: {d.get_work_schedule()}')