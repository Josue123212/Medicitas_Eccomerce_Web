from apps.users.models import SecretaryProfile

secretaries = SecretaryProfile.objects.all()
print('=== NÚMEROS DE TELÉFONO DE SECRETARIAS ===')
for i, s in enumerate(secretaries, 1):
    print(f'{i}. {s.user.first_name} {s.user.last_name}')
    print(f'   Teléfono: {s.phone_number if s.phone_number else "NULL/Vacío"}')
    print(f'   Email: {s.user.email}')
    print()