from rest_framework import serializers
from .models import Contact
from django.contrib.auth.hashers import make_password

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'username', 'password', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Hashear la contraseña antes de guardarla
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)