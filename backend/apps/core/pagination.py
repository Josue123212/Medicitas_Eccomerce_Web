from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict


class CustomPageNumberPagination(PageNumberPagination):
    """
    Paginación personalizada que proporciona información adicional
    sobre los resultados y permite configurar el tamaño de página.
    """
    
    page_size = 20  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Parámetro para cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página permitido
    page_query_param = 'page'  # Parámetro para especificar la página
    
    def get_paginated_response(self, data):
        """
        Retorna una respuesta paginada con información adicional.
        """
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))
    
    def get_paginated_response_schema(self, schema):
        """
        Esquema para la documentación automática de la API.
        """
        return {
            'type': 'object',
            'properties': {
                'count': {
                    'type': 'integer',
                    'description': 'Número total de elementos'
                },
                'total_pages': {
                    'type': 'integer',
                    'description': 'Número total de páginas'
                },
                'current_page': {
                    'type': 'integer',
                    'description': 'Página actual'
                },
                'page_size': {
                    'type': 'integer',
                    'description': 'Tamaño de la página actual'
                },
                'next': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'description': 'URL de la siguiente página'
                },
                'previous': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'description': 'URL de la página anterior'
                },
                'results': schema,
            },
        }


class LargeResultsSetPagination(PageNumberPagination):
    """
    Paginación para conjuntos de datos grandes.
    Útil para reportes o listados extensos.
    """
    
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))


class SmallResultsSetPagination(PageNumberPagination):
    """
    Paginación para conjuntos de datos pequeños.
    Útil para listas de selección o catálogos.
    """
    
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))