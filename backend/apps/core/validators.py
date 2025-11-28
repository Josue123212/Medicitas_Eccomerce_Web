from datetime import datetime, time, timedelta, date
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


def validate_future_date(value):
    """
    Valida que la fecha sea en el futuro (no en el pasado).
    """
    today = timezone.now().date()
    if value < today:
        raise ValidationError(
            _('La fecha no puede ser en el pasado.'),
            code='past_date'
        )


def validate_date_range(start_date, end_date):
    """
    Valida que el rango de fechas sea válido (start_date <= end_date).
    """
    if start_date > end_date:
        raise ValidationError(
            _('La fecha de inicio no puede ser posterior a la fecha de fin.'),
            code='invalid_date_range'
        )


def validate_max_future_date(value, max_months=6):
    """
    Valida que la fecha no sea más de X meses en el futuro.
    """
    max_date = timezone.now().date() + timedelta(days=max_months * 30)
    if value > max_date:
        raise ValidationError(
            _(f'No se pueden programar citas con más de {max_months} meses de anticipación.'),
            code='too_far_future'
        )


def validate_holiday_exclusion(value):
    """
    Valida que la fecha no sea un día feriado.
    Puedes personalizar esta lista según los feriados de tu país.
    """
    # Lista de feriados fijos (formato: (mes, día))
    fixed_holidays = [
        (1, 1),   # Año Nuevo
        (5, 1),   # Día del Trabajo
        (7, 20),  # Día de la Independencia (Colombia)
        (8, 7),   # Batalla de Boyacá (Colombia)
        (12, 8),  # Inmaculada Concepción
        (12, 25), # Navidad
    ]
    
    # Verificar feriados fijos
    if (value.month, value.day) in fixed_holidays:
        raise ValidationError(
            _('No se pueden programar citas en días feriados.'),
            code='holiday_date'
        )


def validate_age_appropriate_time(patient_birth_date, appointment_time):
    """
    Valida horarios apropiados según la edad del paciente.
    Niños menores de 12 años: solo hasta las 4:00 PM
    Adultos mayores (65+): solo desde las 9:00 AM
    """
    today = timezone.now().date()
    age = (today - patient_birth_date).days // 365
    
    # Niños menores de 12 años
    if age < 12 and appointment_time > time(16, 0):  # 4:00 PM
        raise ValidationError(
            _('Las citas para niños menores de 12 años deben ser antes de las 4:00 PM.'),
            code='child_time_restriction'
        )
    
    # Adultos mayores de 65 años
    if age >= 65 and appointment_time < time(9, 0):  # 9:00 AM
        raise ValidationError(
            _('Las citas para adultos mayores deben ser después de las 9:00 AM.'),
            code='senior_time_restriction'
        )


def validate_emergency_appointment_window(value):
    """
    Valida que las citas de emergencia puedan programarse con menos anticipación.
    """
    minimum_datetime = timezone.now() + timedelta(hours=2)
    appointment_datetime = timezone.make_aware(
        datetime.combine(value, time(8, 0))  # Asumiendo hora mínima
    )
    
    if appointment_datetime < minimum_datetime:
        raise ValidationError(
            _('Las citas de emergencia requieren al menos 2 horas de anticipación.'),
            code='emergency_insufficient_notice'
        )


def validate_future_datetime(value):
    """
    Valida que la fecha y hora sean en el futuro.
    """
    now = timezone.now()
    if value < now:
        raise ValidationError(
            _('La fecha y hora no pueden ser en el pasado.'),
            code='past_datetime'
        )


def validate_business_hours(value):
    """
    Valida que la hora esté dentro del horario laboral (8:00 AM - 6:00 PM).
    """
    start_time = time(8, 0)  # 8:00 AM
    end_time = time(18, 0)   # 6:00 PM
    
    if not (start_time <= value <= end_time):
        raise ValidationError(
            _('Las citas solo pueden programarse entre las 8:00 AM y 6:00 PM.'),
            code='outside_business_hours'
        )


def validate_weekday(value):
    """
    Valida que la fecha sea un día de semana (lunes a viernes).
    """
    if value.weekday() >= 5:  # 5 = sábado, 6 = domingo
        raise ValidationError(
            _('Las citas solo pueden programarse de lunes a viernes.'),
            code='weekend_date'
        )


def validate_appointment_time_slot(value):
    """
    Valida que la hora de la cita esté en intervalos de 30 minutos.
    """
    if value.minute not in [0, 30]:
        raise ValidationError(
            _('Las citas deben programarse en intervalos de 30 minutos (ej: 9:00, 9:30, 10:00).'),
            code='invalid_time_slot'
        )


def validate_minimum_advance_notice(date_value, time_value, hours=24):
    """
    Valida que la cita se programe con al menos X horas de anticipación.
    """
    appointment_datetime = timezone.make_aware(
        datetime.combine(date_value, time_value)
    )
    minimum_datetime = timezone.now() + timedelta(hours=hours)
    
    if appointment_datetime < minimum_datetime:
        raise ValidationError(
            _(f'Las citas deben programarse con al menos {hours} horas de anticipación.'),
            code='insufficient_advance_notice'
        )


def validate_modification_window(original_datetime, hours=24):
    """
    Valida que las modificaciones se hagan con al menos X horas de anticipación.
    """
    minimum_modification_time = original_datetime - timedelta(hours=hours)
    
    if timezone.now() > minimum_modification_time:
        raise ValidationError(
            _(f'Las citas solo pueden modificarse con al menos {hours} horas de anticipación.'),
            code='modification_window_expired'
        )


def validate_doctor_availability(doctor, date_value, time_value, exclude_appointment_id=None):
    """
    Valida que el doctor esté disponible en la fecha y hora especificadas.
    """
    from apps.appointments.models import Appointment
    
    # Verificar si el doctor está marcado como disponible
    if not doctor.is_available:
        raise ValidationError(
            _('El doctor no está disponible para nuevas citas.'),
            code='doctor_unavailable'
        )
    
    # Verificar conflictos de horario
    conflicting_appointments = Appointment.objects.filter(
        doctor=doctor,
        date=date_value,
        time=time_value,
        status__in=['scheduled', 'confirmed']
    )
    
    # Excluir la cita actual si estamos editando
    if exclude_appointment_id:
        conflicting_appointments = conflicting_appointments.exclude(
            id=exclude_appointment_id
        )
    
    if conflicting_appointments.exists():
        raise ValidationError(
            _('El doctor ya tiene una cita programada en este horario.'),
            code='doctor_double_booking'
        )


def validate_patient_availability(patient, date_value, time_value, exclude_appointment_id=None):
    """
    Valida que el paciente no tenga otra cita en la misma fecha y hora.
    """
    from apps.appointments.models import Appointment
    
    conflicting_appointments = Appointment.objects.filter(
        patient=patient,
        date=date_value,
        time=time_value,
        status__in=['scheduled', 'confirmed']
    )
    
    # Excluir la cita actual si estamos editando
    if exclude_appointment_id:
        conflicting_appointments = conflicting_appointments.exclude(
            id=exclude_appointment_id
        )
    
    if conflicting_appointments.exists():
        raise ValidationError(
            _('El paciente ya tiene una cita programada en este horario.'),
            code='patient_double_booking'
        )


def validate_max_daily_appointments(doctor, date_value, exclude_appointment_id=None, max_appointments=16):
    """
    Valida que el doctor no exceda el máximo de citas por día.
    """
    from apps.appointments.models import Appointment
    
    daily_appointments = Appointment.objects.filter(
        doctor=doctor,
        date=date_value,
        status__in=['scheduled', 'confirmed']
    )
    
    # Excluir la cita actual si estamos editando
    if exclude_appointment_id:
        daily_appointments = daily_appointments.exclude(
            id=exclude_appointment_id
        )
    
    if daily_appointments.count() >= max_appointments:
        raise ValidationError(
            _(f'El doctor ha alcanzado el máximo de {max_appointments} citas por día.'),
            code='max_daily_appointments_exceeded'
        )


class DateValidator:
    """
    Clase para validaciones avanzadas de fechas.
    """
    
    @staticmethod
    def validate_appointment_date(date_value, include_holidays=True, max_months=6):
        """
        Validación completa para fechas de citas.
        """
        # Validaciones básicas
        validate_future_date(date_value)
        validate_weekday(date_value)
        validate_max_future_date(date_value, max_months)
        
        # Validación de feriados (opcional)
        if include_holidays:
            validate_holiday_exclusion(date_value)
    
    @staticmethod
    def validate_date_with_patient_age(date_value, time_value, patient_birth_date):
        """
        Validación de fecha y hora considerando la edad del paciente.
        """
        validate_future_date(date_value)
        validate_weekday(date_value)
        validate_age_appropriate_time(patient_birth_date, time_value)
    
    @staticmethod
    def validate_emergency_date(date_value):
        """
        Validación específica para citas de emergencia.
        """
        validate_emergency_appointment_window(date_value)
        # Las citas de emergencia pueden ser en fines de semana
        # pero aún deben ser en el futuro
        validate_future_date(date_value)


class AppointmentValidator:
    """
    Clase para validar citas de manera integral.
    """
    
    @staticmethod
    def validate_appointment_creation(doctor, patient, date_value, time_value):
        """
        Valida todos los aspectos de la creación de una nueva cita.
        """
        # Validaciones básicas de fecha y hora
        validate_future_date(date_value)
        validate_weekday(date_value)
        validate_business_hours(time_value)
        validate_appointment_time_slot(time_value)
        
        # Validación de anticipación mínima
        validate_minimum_advance_notice(date_value, time_value)
        
        # Validaciones de disponibilidad
        validate_doctor_availability(doctor, date_value, time_value)
        validate_patient_availability(patient, date_value, time_value)
        
        # Validación de límite diario
        validate_max_daily_appointments(doctor, date_value)
    
    @staticmethod
    def validate_appointment_update(appointment, new_doctor=None, new_patient=None, 
                                  new_date=None, new_time=None):
        """
        Valida la actualización de una cita existente.
        """
        # Usar valores actuales si no se proporcionan nuevos
        doctor = new_doctor or appointment.doctor
        patient = new_patient or appointment.patient
        date_value = new_date or appointment.date
        time_value = new_time or appointment.time
        
        # Validar ventana de modificación
        original_datetime = timezone.make_aware(
            datetime.combine(appointment.date, appointment.time)
        )
        validate_modification_window(original_datetime)
        
        # Validaciones básicas de fecha y hora
        validate_future_date(date_value)
        validate_weekday(date_value)
        validate_business_hours(time_value)
        validate_appointment_time_slot(time_value)
        
        # Validación de anticipación mínima
        validate_minimum_advance_notice(date_value, time_value)
        
        # Validaciones de disponibilidad (excluyendo la cita actual)
        validate_doctor_availability(doctor, date_value, time_value, appointment.id)
        validate_patient_availability(patient, date_value, time_value, appointment.id)
        
        # Validación de límite diario
        validate_max_daily_appointments(doctor, date_value, appointment.id)
