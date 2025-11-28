import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer

appointments = Appointment.objects.select_related('patient__user', 'doctor__user').all()[:2]
if appointments.exists():
    serializer = AppointmentSerializer(appointments, many=True)
    data = serializer.data
    print('📊 DATOS DE CITAS:')
    for appointment in data:
        print(f'ID: {appointment["id"]}')
        patient_info = appointment.get('patient_info', {})
        print(f'Paciente full_name: {patient_info.get("full_name", "N/A")}')
        print(f'Paciente campos: {list(patient_info.keys())}')
        doctor_info = appointment.get('doctor_info', {})
        print(f'Doctor full_name: {doctor_info.get("full_name", "N/A")}')
        print(f'Doctor campos: {list(doctor_info.keys())}')
        print('---')
        break
else:
    print('❌ No hay citas en la base de datos')