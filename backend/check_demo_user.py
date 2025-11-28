from apps.users.models import User

try:
    user = User.objects.get(email='demo@medicitas.com')
    print(f'Usuario: {user.username}')
    print(f'Email: {user.email}')
    print(f'Rol: {user.role}')
    print(f'Activo: {user.is_active}')
except User.DoesNotExist:
    print('Usuario demo no existe')
    print('Usuarios existentes:')
    for u in User.objects.all():
        print(f'- {u.username} ({u.email}) - Rol: {u.role}')