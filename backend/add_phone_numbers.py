from apps.users.models import SecretaryProfile

# Obtener todas las secretarias
secretaries = SecretaryProfile.objects.all()

if secretaries.exists():
    print(f'Encontradas {secretaries.count()} secretarias')
    
    # Números de teléfono de ejemplo
    phone_numbers = [
        '+1-555-0101',
        '+1-555-0102', 
        '+1-555-0103',
        '+1-555-0104',
        '+1-555-0105'
    ]
    
    for i, secretary in enumerate(secretaries):
        if i < len(phone_numbers):
            secretary.phone_number = phone_numbers[i]
            secretary.save()
            print(f'Agregado teléfono {phone_numbers[i]} a {secretary.user.first_name} {secretary.user.last_name}')
        else:
            # Si hay más secretarias que números, usar un patrón
            phone = f'+1-555-{1000 + i:04d}'
            secretary.phone_number = phone
            secretary.save()
            print(f'Agregado teléfono {phone} a {secretary.user.first_name} {secretary.user.last_name}')
    
    print('¡Números de teléfono agregados exitosamente!')
else:
    print('No se encontraron secretarias en la base de datos')