from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema
from django.urls import reverse
from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import json
import urllib.request
import urllib.error


@api_view(['GET'])
def api_documentation(request):
    """
    Vista personalizada para mostrar la documentación de la API.
    """
    schema_url = request.build_absolute_uri(reverse('schema'))
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Medical Appointment System API</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
        <style>
            html {{
                box-sizing: border-box;
                overflow: -moz-scrollbars-vertical;
                overflow-y: scroll;
            }}
            *, *:before, *:after {{
                box-sizing: inherit;
            }}
            body {{
                margin:0;
                background: #fafafa;
            }}
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {{
                const ui = SwaggerUIBundle({{
                    url: '{schema_url}',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout"
                }});
            }};
        </script>
    </body>
    </html>
    """
    
    return HttpResponse(html_content, content_type='text/html')


@api_view(['GET'])
def api_status(request):
    """
    Vista para verificar el estado de la API.
    """
    return Response({
        'status': 'active',
        'message': 'Medical Appointment System API is running',
        'version': '1.0.0',
        'endpoints': {
            'documentation': '/api/docs/',
            'schema': '/api/schema/',
            'users': '/api/users/',
            'patients': '/api/patients/',
            'doctors': '/api/doctors/',
            'appointments': '/api/appointments/',
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def local_ai_chat(request):
    endpoint = getattr(settings, 'LOCAL_AI_ENDPOINT', 'http://localhost:11964').rstrip('/')
    model = request.data.get('model') or getattr(settings, 'LOCAL_AI_DEFAULT_MODEL', '')
    messages = request.data.get('messages') or []

    if not isinstance(messages, list) or not messages:
        return Response({'error': 'messages vacío o malformado'}, status=400)

    # Si no hay modelo, intentar descubrir el primero disponible
    if not model:
        try:
            models_url = endpoint + '/v1/models'
            with urllib.request.urlopen(models_url, timeout=10) as mresp:
                mdata = json.loads(mresp.read().decode('utf-8'))
                # OpenAI-like: {data: [{id: '...'}]}
                if isinstance(mdata, dict) and isinstance(mdata.get('data'), list) and mdata['data']:
                    model = mdata['data'][0].get('id') or ''
        except Exception:
            pass

    payload = {'messages': messages}
    if model:
        payload['model'] = model

    url = endpoint + '/v1/chat/completions'
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return Response(data)
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode('utf-8')
            err = json.loads(err_body)
        except Exception:
            err = {'error': str(e)}
        return Response(err, status=e.code)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
