from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError
from .models import User
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class DynamicUserCreationForm(UserCreationForm):
    """
    Formulario dinámico para crear usuarios con campos específicos según el rol.
    """
    
    # Campos básicos de usuario
    first_name = forms.CharField(max_length=30, required=True, label='Nombre')
    last_name = forms.CharField(max_length=30, required=True, label='Apellido')
    email = forms.EmailField(required=True, label='Correo electrónico')
    phone = forms.CharField(max_length=15, required=False, label='Teléfono')
    date_of_birth = forms.DateField(required=False, label='Fecha de nacimiento', widget=forms.DateInput(attrs={'type': 'date'}))
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Dirección')
    
    # Campos específicos para Doctor
    medical_license = forms.CharField(max_length=50, required=False, label='Licencia Médica')
    specialization = forms.CharField(max_length=100, required=False, label='Especialización')
    years_experience = forms.IntegerField(min_value=0, required=False, label='Años de Experiencia')
    consultation_fee = forms.DecimalField(max_digits=10, decimal_places=2, required=False, label='Tarifa de Consulta')
    bio = forms.CharField(widget=forms.Textarea(attrs={'rows': 4}), required=False, label='Biografía')
    is_available = forms.BooleanField(required=False, initial=True, label='Disponible')
    work_days = forms.MultipleChoiceField(
        choices=[
            ('monday', 'Lunes'),
            ('tuesday', 'Martes'),
            ('wednesday', 'Miércoles'),
            ('thursday', 'Jueves'),
            ('friday', 'Viernes'),
            ('saturday', 'Sábado'),
            ('sunday', 'Domingo'),
        ],
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label='Días de trabajo'
    )
    
    # Campos específicos para Patient
    gender = forms.ChoiceField(
        choices=[('', '--- Seleccionar ---')] + Patient.GENDER_CHOICES,
        required=False,
        label='Género'
    )
    emergency_contact_name = forms.CharField(max_length=100, required=False, label='Contacto de emergencia')
    emergency_contact_phone = forms.CharField(max_length=17, required=False, label='Teléfono de emergencia')
    emergency_contact_relationship = forms.CharField(max_length=50, required=False, label='Relación con contacto')
    blood_type = forms.ChoiceField(
        choices=[('', '--- Seleccionar ---')] + [
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        required=False,
        label='Tipo de sangre'
    )
    allergies = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Alergias')
    medical_conditions = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Condiciones médicas')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Agregar clases CSS para el comportamiento dinámico
        self.fields['role'].widget.attrs.update({'id': 'id_role', 'onchange': 'toggleRoleFields()'})
        
        # Campos específicos de doctor
        doctor_fields = ['medical_license', 'specialization', 'years_experience', 'consultation_fee', 'bio', 'is_available', 'work_days']
        for field in doctor_fields:
            if field in self.fields:
                self.fields[field].widget.attrs.update({'class': 'doctor-field', 'style': 'display: none;'})
        
        # Campos específicos de paciente
        patient_fields = ['gender', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship', 'blood_type', 'allergies', 'medical_conditions']
        for field in patient_fields:
            if field in self.fields:
                self.fields[field].widget.attrs.update({'class': 'patient-field', 'style': 'display: none;'})
    
    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        
        # Validaciones específicas según el rol
        if role == 'doctor':
            if not cleaned_data.get('medical_license'):
                raise ValidationError({'medical_license': 'La licencia médica es requerida para doctores.'})
            if not cleaned_data.get('specialization'):
                raise ValidationError({'specialization': 'La especialización es requerida para doctores.'})
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        # Guardar campos adicionales del usuario
        user.phone = self.cleaned_data.get('phone', '')
        user.date_of_birth = self.cleaned_data.get('date_of_birth')
        user.address = self.cleaned_data.get('address', '')
        
        if commit:
            user.save()
            
            # Crear perfil específico según el rol
            if user.role == 'doctor':
                self._create_doctor_profile(user)
            elif user.role == 'client':
                self._create_patient_profile(user)
        
        return user
    
    def _create_doctor_profile(self, user):
        """Crear perfil de doctor con los datos del formulario."""
        work_days = self.cleaned_data.get('work_days', [])
        
        Doctor.objects.create(
            user=user,
            medical_license=self.cleaned_data.get('medical_license', f"LIC-{user.id:06d}"),
            specialization=self.cleaned_data.get('specialization', 'Medicina General'),
            years_experience=self.cleaned_data.get('years_experience', 0),
            consultation_fee=self.cleaned_data.get('consultation_fee', 50.00),
            bio=self.cleaned_data.get('bio', ''),
            is_available=self.cleaned_data.get('is_available', True),
            work_days=work_days if work_days else ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        )
    
    def _create_patient_profile(self, user):
        """Crear o actualizar perfil de paciente con los datos del formulario."""
        from apps.patients.models import Patient
        
        # Verificar si ya existe un perfil (creado por signal)
        try:
            patient = user.patient_profile
            # Si existe, actualizar con los datos del formulario
            patient.date_of_birth = self.cleaned_data.get('date_of_birth') or patient.date_of_birth
            patient.gender = self.cleaned_data.get('gender', '') or patient.gender
            patient.phone_number = self.cleaned_data.get('phone', '') or patient.phone_number
            patient.emergency_contact_name = self.cleaned_data.get('emergency_contact_name', '') or patient.emergency_contact_name
            patient.emergency_contact_phone = self.cleaned_data.get('emergency_contact_phone', '') or patient.emergency_contact_phone
            patient.emergency_contact_relationship = self.cleaned_data.get('emergency_contact_relationship', '') or patient.emergency_contact_relationship
            patient.blood_type = self.cleaned_data.get('blood_type', '') or patient.blood_type
            patient.allergies = self.cleaned_data.get('allergies', '') or patient.allergies
            patient.medical_conditions = self.cleaned_data.get('medical_conditions', '') or patient.medical_conditions
            patient.save()
            print(f"✅ Perfil de paciente actualizado para: {user.username}")
        except Patient.DoesNotExist:
            # Si no existe, crear uno nuevo
            Patient.objects.create(
                user=user,
                date_of_birth=self.cleaned_data.get('date_of_birth'),
                gender=self.cleaned_data.get('gender', ''),
                phone_number=self.cleaned_data.get('phone', ''),
                emergency_contact_name=self.cleaned_data.get('emergency_contact_name', ''),
                emergency_contact_phone=self.cleaned_data.get('emergency_contact_phone', ''),
                emergency_contact_relationship=self.cleaned_data.get('emergency_contact_relationship', ''),
                blood_type=self.cleaned_data.get('blood_type', ''),
                allergies=self.cleaned_data.get('allergies', ''),
                medical_conditions=self.cleaned_data.get('medical_conditions', '')
            )
            print(f"✅ Perfil de paciente creado para: {user.username}")


class DynamicUserChangeForm(UserChangeForm):
    """
    Formulario dinámico para editar usuarios existentes.
    """
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')


class DoctorCreationForm(UserCreationForm):
    """
    Formulario específico para crear doctores.
    """
    
    # Campos básicos de usuario
    first_name = forms.CharField(max_length=30, required=True, label='Nombre')
    last_name = forms.CharField(max_length=30, required=True, label='Apellido')
    email = forms.EmailField(required=True, label='Correo electrónico')
    phone = forms.CharField(max_length=15, required=True, label='Teléfono')
    date_of_birth = forms.DateField(required=False, label='Fecha de nacimiento', widget=forms.DateInput(attrs={'type': 'date'}))
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Dirección')
    
    # Campos específicos para Doctor
    medical_license = forms.CharField(max_length=50, required=True, label='Licencia Médica')
    specialization = forms.CharField(max_length=100, required=True, label='Especialización')
    years_experience = forms.IntegerField(min_value=0, required=True, label='Años de Experiencia')
    consultation_fee = forms.DecimalField(max_digits=10, decimal_places=2, required=True, label='Tarifa de Consulta')
    bio = forms.CharField(widget=forms.Textarea(attrs={'rows': 4}), required=False, label='Biografía')
    is_available = forms.BooleanField(required=False, initial=True, label='Disponible')
    work_days = forms.MultipleChoiceField(
        choices=[
            ('monday', 'Lunes'),
            ('tuesday', 'Martes'),
            ('wednesday', 'Miércoles'),
            ('thursday', 'Jueves'),
            ('friday', 'Viernes'),
            ('saturday', 'Sábado'),
            ('sunday', 'Domingo'),
        ],
        widget=forms.CheckboxSelectMultiple,
        required=True,
        label='Días de trabajo'
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_superuser')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'doctor'
        user.phone = self.cleaned_data.get('phone', '')
        user.date_of_birth = self.cleaned_data.get('date_of_birth')
        user.address = self.cleaned_data.get('address', '')
        
        if commit:
            user.save()
            self.save_profile(user)
        
        return user
    
    def save_profile(self, user):
        """Crear perfil de doctor."""
        work_days = self.cleaned_data.get('work_days', [])
        
        Doctor.objects.create(
            user=user,
            medical_license=self.cleaned_data.get('medical_license'),
            specialization=self.cleaned_data.get('specialization'),
            years_experience=self.cleaned_data.get('years_experience', 0),
            consultation_fee=self.cleaned_data.get('consultation_fee', 50.00),
            bio=self.cleaned_data.get('bio', ''),
            is_available=self.cleaned_data.get('is_available', True),
            work_days=work_days
        )


class PatientCreationForm(UserCreationForm):
    """
    Formulario específico para crear pacientes.
    """
    
    # Campos básicos de usuario
    first_name = forms.CharField(max_length=30, required=True, label='Nombre')
    last_name = forms.CharField(max_length=30, required=True, label='Apellido')
    email = forms.EmailField(required=True, label='Correo electrónico')
    phone = forms.CharField(max_length=15, required=True, label='Teléfono')
    date_of_birth = forms.DateField(required=True, label='Fecha de nacimiento', widget=forms.DateInput(attrs={'type': 'date'}))
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Dirección')
    
    # Campos específicos para Patient
    gender = forms.ChoiceField(
        choices=Patient.GENDER_CHOICES,
        required=True,
        label='Género'
    )
    emergency_contact_name = forms.CharField(max_length=100, required=True, label='Contacto de emergencia')
    emergency_contact_phone = forms.CharField(max_length=17, required=True, label='Teléfono de emergencia')
    emergency_contact_relationship = forms.CharField(max_length=50, required=True, label='Relación con contacto')
    blood_type = forms.ChoiceField(
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        required=False,
        label='Tipo de sangre'
    )
    allergies = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Alergias')
    medical_conditions = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Condiciones médicas')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'client'
        user.phone = self.cleaned_data.get('phone', '')
        user.date_of_birth = self.cleaned_data.get('date_of_birth')
        user.address = self.cleaned_data.get('address', '')
        
        if commit:
            user.save()
            self.save_profile(user)
        
        return user
    
    def save_profile(self, user):
        """Crear o actualizar perfil de paciente."""
        from apps.patients.models import Patient
        
        # Verificar si ya existe un perfil (creado por signal)
        try:
            patient = user.patient_profile
            # Si existe, actualizar con los datos del formulario
            patient.date_of_birth = self.cleaned_data.get('date_of_birth') or patient.date_of_birth
            patient.gender = self.cleaned_data.get('gender', '') or patient.gender
            patient.phone_number = self.cleaned_data.get('phone', '') or patient.phone_number
            patient.emergency_contact_name = self.cleaned_data.get('emergency_contact_name', '') or patient.emergency_contact_name
            patient.emergency_contact_phone = self.cleaned_data.get('emergency_contact_phone', '') or patient.emergency_contact_phone
            patient.emergency_contact_relationship = self.cleaned_data.get('emergency_contact_relationship', '') or patient.emergency_contact_relationship
            patient.blood_type = self.cleaned_data.get('blood_type', '') or patient.blood_type
            patient.allergies = self.cleaned_data.get('allergies', '') or patient.allergies
            patient.medical_conditions = self.cleaned_data.get('medical_conditions', '') or patient.medical_conditions
            patient.save()
            print(f"✅ Perfil de paciente actualizado para: {user.username}")
        except Patient.DoesNotExist:
            # Si no existe, crear uno nuevo
            Patient.objects.create(
                user=user,
                date_of_birth=self.cleaned_data.get('date_of_birth'),
                gender=self.cleaned_data.get('gender', ''),
                phone_number=self.cleaned_data.get('phone', ''),
                emergency_contact_name=self.cleaned_data.get('emergency_contact_name', ''),
                emergency_contact_phone=self.cleaned_data.get('emergency_contact_phone', ''),
                emergency_contact_relationship=self.cleaned_data.get('emergency_contact_relationship', ''),
                blood_type=self.cleaned_data.get('blood_type', ''),
                allergies=self.cleaned_data.get('allergies', ''),
                medical_conditions=self.cleaned_data.get('medical_conditions', '')
            )
            print(f"✅ Perfil de paciente creado para: {user.username}")


class SecretaryCreationForm(UserCreationForm):
    """
    Formulario específico para crear secretarias.
    """
    
    # Campos básicos de usuario
    first_name = forms.CharField(max_length=30, required=True, label='Nombre')
    last_name = forms.CharField(max_length=30, required=True, label='Apellido')
    email = forms.EmailField(required=True, label='Correo electrónico')
    phone = forms.CharField(max_length=15, required=True, label='Teléfono')
    date_of_birth = forms.DateField(required=False, label='Fecha de nacimiento', widget=forms.DateInput(attrs={'type': 'date'}))
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Dirección')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'secretary'
        user.phone = self.cleaned_data.get('phone', '')
        user.date_of_birth = self.cleaned_data.get('date_of_birth')
        user.address = self.cleaned_data.get('address', '')
        
        if commit:
            user.save()
            # Crear perfil de secretaria si es necesario
            from .models import SecretaryProfile
            SecretaryProfile.objects.get_or_create(user=user)
        
        return user


class AdminCreationForm(UserCreationForm):
    """
    Formulario específico para crear administradores.
    """
    
    # Campos básicos de usuario
    first_name = forms.CharField(max_length=30, required=True, label='Nombre')
    last_name = forms.CharField(max_length=30, required=True, label='Apellido')
    email = forms.EmailField(required=True, label='Correo electrónico')
    phone = forms.CharField(max_length=15, required=False, label='Teléfono')
    date_of_birth = forms.DateField(required=False, label='Fecha de nacimiento', widget=forms.DateInput(attrs={'type': 'date'}))
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False, label='Dirección')
    
    # Campos específicos de administrador
    is_staff = forms.BooleanField(required=False, initial=True, label='Es staff')
    is_superuser = forms.BooleanField(required=False, initial=False, label='Es superusuario')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'admin'
        user.phone = self.cleaned_data.get('phone', '')
        user.date_of_birth = self.cleaned_data.get('date_of_birth')
        user.address = self.cleaned_data.get('address', '')
        user.is_staff = self.cleaned_data.get('is_staff', True)
        user.is_superuser = self.cleaned_data.get('is_superuser', False)
        
        if commit:
            user.save()
        
        return user