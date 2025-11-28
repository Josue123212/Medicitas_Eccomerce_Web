from decimal import Decimal
from datetime import timedelta, datetime, time

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient

from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.appointments.models import Appointment


class AppointmentConflictTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()

        # Crear usuario paciente y perfil
        self.patient_user = User.objects.create_user(
            username="patient1",
            email="patient1@example.com",
            password="Pass1234!",
            role="client",
        )
        self.patient = self.patient_user.patient_profile

        # Crear usuario doctor y perfil
        self.doctor_user = User.objects.create_user(
            username="doctor1",
            email="doctor1@example.com",
            password="Pass1234!",
            role="doctor",
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            medical_license="LIC-123",
            specialization="Cardiologia",
            years_experience=5,
            consultation_fee=Decimal("100.00"),
            is_available=True,
            work_days=["monday", "tuesday", "wednesday", "thursday", "friday"],
        )

        self.date = timezone.now().date() + timedelta(days=2)
        while self.date.weekday() >= 5:
            self.date += timedelta(days=1)
        self.time_10 = time(10, 0)
        self.time_1030 = time(10, 30)
        self.time_11 = time(11, 0)
        self.base_payload = {
            "patient": self.patient.id,
            "doctor": self.doctor.id,
            "date": self.date.strftime("%Y-%m-%d"),
            "time": self.time_10.strftime("%H:%M"),
            "reason": "Consulta de control",
            "notes": "",
        }

    def test_prevent_double_booking_on_create(self):
        # Autenticar como paciente
        self.client.force_authenticate(self.patient_user)
        # Crear primera cita
        res1 = self.client.post("/api/appointments/", self.base_payload, format="json")
        self.assertEqual(res1.status_code, 201)
        # Intentar segunda cita en mismo slot
        res2 = self.client.post("/api/appointments/", self.base_payload, format="json")
        self.assertEqual(res2.status_code, 400)
        self.assertIn("Conflicto", str(res2.data.get("error", "")))

    def test_prevent_double_booking_on_update(self):
        # Crear dos citas en horarios distintos
        self.client.force_authenticate(self.patient_user)
        payload_a = {**self.base_payload}
        payload_b = {**self.base_payload, "time": self.time_1030.strftime("%H:%M")}
        res_a = self.client.post("/api/appointments/", payload_a, format="json")
        res_b = self.client.post("/api/appointments/", payload_b, format="json")
        self.assertEqual(res_a.status_code, 201)
        self.assertEqual(res_b.status_code, 201)
        appt_b_id = res_b.data["id"] if isinstance(res_b.data, dict) and "id" in res_b.data else res_b.data.get("data", {}).get("id")

        # Intentar mover B al horario de A (conflicto)
        update_payload = {"time": self.time_10.strftime("%H:%M")}
        res_upd = self.client.patch(f"/api/appointments/{appt_b_id}/", update_payload, format="json")
        self.assertEqual(res_upd.status_code, 400)

    def test_prevent_double_booking_on_reschedule(self):
        # Crear dos citas en horarios distintos
        self.client.force_authenticate(self.patient_user)
        payload_a = {**self.base_payload, "time": self.time_11.strftime("%H:%M")}
        payload_b = {**self.base_payload, "time": self.time_1030.strftime("%H:%M")}
        res_a = self.client.post("/api/appointments/", payload_a, format="json")
        res_b = self.client.post("/api/appointments/", payload_b, format="json")
        self.assertEqual(res_a.status_code, 201)
        self.assertEqual(res_b.status_code, 201)
        appt_a_id = res_a.data.get("id") or res_a.data.get("data", {}).get("id")
        appt_b_id = res_b.data.get("id") or res_b.data.get("data", {}).get("id")

        # Autenticar como doctor (reschedule requiere doctor/admin)
        self.client.force_authenticate(self.doctor_user)
        res_re = self.client.post(
            f"/api/appointments/{appt_b_id}/reschedule/",
            {"date": self.date.strftime("%Y-%m-%d"), "time": self.time_11.strftime("%H:%M")},
            format="json",
        )
        self.assertEqual(res_re.status_code, 400)
