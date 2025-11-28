from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema
from django.urls import reverse
from django.shortcuts import render
from django.http import HttpResponse


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