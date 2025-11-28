from apps.users.models import SecretaryProfile, User

print('=== VERIFICANDO DATOS DE PAL PAN ===')

# Buscar por nombre
pal_users = User.objects.filter(first_name__icontains='Pal', last_name__icontains='Pan')
print(f'Usuarios encontrados con nombre Pal Pan: {pal_users.count()}')

for user in pal_users:
    print(f'\n👤 Usuario: {user.first_name} {user.last_name}')
    print(f'   📧 Email: {user.email}')
    print(f'   📱 Teléfono (user.phone): {user.phone}')
    print(f'   🆔 Username: {user.username}')
    print(f'   🎭 Rol: {user.role}')
    
    if hasattr(user, 'secretary_profile'):
        secretary = user.secretary_profile
        print(f'   🏢 Perfil de Secretaria:')
        print(f'      - ID Empleado: {secretary.employee_id}')
        print(f'      - Departamento: {secretary.department}')
        print(f'      - Turno: {secretary.shift_start} - {secretary.shift_end}')
        print(f'      - Fecha contratación: {secretary.hire_date}')
    else:
        print('   ❌ No tiene perfil de secretaria')

# También buscar por employee_id si lo conocemos
cor_secretaries = SecretaryProfile.objects.filter(employee_id__icontains='COR1234')
print(f'\n🔍 Secretarias con ID COR1234: {cor_secretaries.count()}')

for secretary in cor_secretaries:
    user = secretary.user
    print(f'\n👤 Secretaria: {user.first_name} {user.last_name}')
    print(f'   📧 Email: {user.email}')
    print(f'   📱 Teléfono (user.phone): {user.phone}')
    print(f'   🆔 Employee ID: {secretary.employee_id}')
    print(f'   🏢 Departamento: {secretary.department}')