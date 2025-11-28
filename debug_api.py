#!/usr/bin/env python3

import requests
import json

def test_doctors_api():
    """Prueba simple de la API de doctores"""
    url = 'http://127.0.0.1:8000/api/doctors/'
    
    print(f"🔍 Probando: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ JSON válido recibido")
                print(f"📦 Tipo de datos: {type(data)}")
                
                if isinstance(data, list):
                    doctors = data
                elif isinstance(data, dict) and 'results' in data:
                    doctors = data['results']
                else:
                    print(f"❌ Estructura de datos inesperada: {data}")
                    return
                
                print(f"👥 Doctores encontrados: {len(doctors)}")
                
                if doctors:
                    doctor = doctors[0]
                    print(f"\n🔍 Primer doctor:")
                    for key, value in doctor.items():
                        print(f"  {key}: {value}")
                        
                    # Verificar campos específicos
                    required_fields = ['status_badge_text', 'status_color', 'status_display']
                    missing_fields = [field for field in required_fields if field not in doctor]
                    
                    if missing_fields:
                        print(f"\n❌ Campos faltantes: {missing_fields}")
                    else:
                        print(f"\n✅ Todos los campos de badge presentes!")
                        
            except json.JSONDecodeError as e:
                print(f"❌ Error al decodificar JSON: {e}")
                print(f"📄 Contenido de respuesta: {response.text[:500]}...")
                
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            print(f"📄 Contenido: {response.text[:500]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_doctors_api()