from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema
from django.urls import reverse
from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
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


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_csrf(request):
    from django.middleware.csrf import get_token
    token = get_token(request)
    resp = Response({'csrf_token': token})
    resp.set_cookie('csrftoken', token)
    return resp

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def local_ai_chat(request):
    endpoint = (getattr(settings, 'LLM_BASE_URL', None) or getattr(settings, 'LOCAL_AI_ENDPOINT', 'http://localhost:11964')).rstrip('/')
    api_key = getattr(settings, 'LLM_API_KEY', '')
    model = request.data.get('model') or getattr(settings, 'LOCAL_AI_DEFAULT_MODEL', '')
    messages = request.data.get('messages') or []
    if not messages:
        text = request.data.get('text') or request.data.get('message') or ''
        if isinstance(text, str) and text.strip():
            messages = [{ 'role': 'user', 'content': text.strip() }]
    # Normalizar mensajes si vienen como lista de strings
    if isinstance(messages, list) and messages and isinstance(messages[0], str):
        messages = [{ 'role': 'user', 'content': ' '.join([str(m) for m in messages if isinstance(m, str)]) }]

    if not isinstance(messages, list) or not messages:
        messages = [{'role': 'user', 'content': 'Hola'}]

    # Normalizar base para evitar doble /v1
    base = endpoint.rstrip('/')
    has_v1 = base.endswith('/v1')
    # Si no hay modelo, intentar descubrir el primero disponible
    if not model:
        try:
            models_url = (base + '/models') if has_v1 else (base + '/v1/models')
            req = urllib.request.Request(models_url, headers={'Authorization': f'Bearer {api_key}'} if api_key else {})
            with urllib.request.urlopen(req, timeout=10) as mresp:
                mdata = json.loads(mresp.read().decode('utf-8'))
                # OpenAI-like: {data: [{id: '...'}]}
                if isinstance(mdata, dict) and isinstance(mdata.get('data'), list) and mdata['data']:
                    model = mdata['data'][0].get('id') or ''
        except Exception:
            pass

    payload = {'messages': messages}
    if model:
        payload['model'] = model
    # Parámetros por defecto seguros
    payload.setdefault('temperature', 0.7)
    payload.setdefault('top_p', 1)
    payload.setdefault('n', 1)
    payload.setdefault('max_tokens', 256)

    url = (base + '/chat/completions') if has_v1 else (base + '/v1/chat/completions')
    headers = {'Content-Type': 'application/json'}
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
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
        text = None
        if isinstance(err, dict):
            text = err.get('error') or err.get('message') or err.get('detail')
            if isinstance(text, dict):
                text = text.get('message') or str(text)
        else:
            text = str(err)
        fallback = text or 'El asistente no pudo responder en este momento.'
        return Response({'choices': [{'message': {'content': fallback}}]}, status=200)
    except Exception as e:
        fallback = f'Error del asistente: {str(e)}'
        return Response({'choices': [{'message': {'content': fallback}}]}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def local_ai_chat_simple(request):
    try:
        print('AI_CHAT_SIMPLE: method=', request.method, 'ct=', request.META.get('CONTENT_TYPE'), 'len=', len(request.body or b''))
    except Exception:
        pass
    endpoint = (getattr(settings, 'LLM_BASE_URL', None) or getattr(settings, 'LOCAL_AI_ENDPOINT', 'http://localhost:11964')).rstrip('/')
    api_key = getattr(settings, 'LLM_API_KEY', '')
    model = getattr(settings, 'LOCAL_AI_DEFAULT_MODEL', '')
    try:
        raw = request.body
        data = json.loads(raw.decode('utf-8')) if raw else {}
    except Exception:
        data = {}
    m = data.get('model') or model
    messages = data.get('messages') or []
    if not messages:
        text = data.get('text') or data.get('message') or ''
        if isinstance(text, str) and text.strip():
            messages = [{ 'role': 'user', 'content': text.strip() }]
        else:
            messages = [{ 'role': 'user', 'content': 'Hola' }]
    if isinstance(messages, list) and messages and isinstance(messages[0], str):
        messages = [{ 'role': 'user', 'content': ' '.join([str(x) for x in messages if isinstance(x, str)]) }]
    base = endpoint.rstrip('/')
    has_v1 = base.endswith('/v1')
    payload = {'messages': messages, 'temperature': 0.7, 'top_p': 1, 'n': 1, 'max_tokens': 256}
    if m:
        payload['model'] = m
    url = (base + '/chat/completions') if has_v1 else (base + '/v1/chat/completions')
    headers = {'Content-Type': 'application/json'}
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    def do_call(u, body, hdrs):
        req = urllib.request.Request(u, data=json.dumps(body).encode('utf-8'), headers=hdrs)
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode('utf-8'))
    try:
        data = do_call(url, payload, headers)
        try:
            has_assistant = any((isinstance(m, dict) and m.get('role') == 'assistant') for m in messages)
        except Exception:
            has_assistant = True
        if not has_assistant:
            try:
                content = data.get('choices', [{}])[0].get('message', {}).get('content')
                if isinstance(content, str):
                    data['choices'][0]['message']['content'] = 'Yo soy tu agente de Farmacia MediCitas; ¿qué necesitas hoy? ' + content
            except Exception:
                pass
        return JsonResponse(data)
    except urllib.error.HTTPError as e:
        detail = None
        raw = None
        try:
            raw = e.read().decode('utf-8')
            err = json.loads(raw)
            detail = err.get('error') or err.get('message') or err.get('detail')
        except Exception:
            detail = str(e)
        # Intentar descubrir y usar un modelo válido, aunque el modelo venga en el payload
        try:
            models_url = (base + '/models') if has_v1 else (base + '/v1/models')
            r = urllib.request.Request(models_url, headers={'Authorization': f'Bearer {api_key}'} if api_key else {})
            with urllib.request.urlopen(r, timeout=10) as mresp:
                mdata = json.loads(mresp.read().decode('utf-8'))
                if isinstance(mdata, dict) and isinstance(mdata.get('data'), list) and mdata['data']:
                    payload['model'] = mdata['data'][0].get('id') or ''
                    try:
                        data = do_call(url, payload, headers)
                        try:
                            has_assistant = any((isinstance(m, dict) and m.get('role') == 'assistant') for m in messages)
                        except Exception:
                            has_assistant = True
                        if not has_assistant:
                            try:
                                content = data.get('choices', [{}])[0].get('message', {}).get('content')
                                if isinstance(content, str):
                                    data['choices'][0]['message']['content'] = 'Yo soy tu agente de Farmacia MediCitas; ¿qué necesitas hoy? ' + content
                            except Exception:
                                pass
                        return JsonResponse(data)
                    except Exception:
                        pass
        except Exception:
            pass
        msg = detail or (raw or 'Error del asistente: Bad Request')
        return JsonResponse({'choices': [{'message': {'content': msg}}]}, status=200)
    except Exception as e:
        fallback = f'Error del asistente: {str(e)}'
        return JsonResponse({'choices': [{'message': {'content': fallback}}]}, status=200)
