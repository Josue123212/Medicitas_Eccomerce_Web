FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir django==5.0.1 djangorestframework django-filter python-decouple stripe pillow django-cors-headers celery djangorestframework-simplejwt drf-spectacular django-allauth dj-rest-auth cryptography
EXPOSE 8000
CMD ["python","manage.py","runserver","0.0.0.0:8000"]
