#!/bin/bash

# Script para preparar y subir los cambios al repositorio para Vercel
echo "🚀 Preparando CareerFlow AI para despliegue en Vercel..."

# 1. Verificar archivos críticos
if [ ! -f "firebase-applet-config.json" ]; then
    echo "❌ Error: No se encuentra firebase-applet-config.json"
    exit 1
fi

# 2. Asegurar que el archivo de configuración de Firebase NO esté en .gitignore
# Esto es necesario para que Vercel lo tome automáticamente
if grep -q "firebase-applet-config.json" .gitignore; then
    echo "📝 Eliminando firebase-applet-config.json de .gitignore para que Vercel lo detecte..."
    sed -i '/firebase-applet-config.json/d' .gitignore
fi

# 3. Instrucciones finales
echo ""
echo "✅ ¡Todo listo para subir!"
echo "--------------------------------------------------------"
echo "PASOS A SEGUIR PARA VERCEL Y RENDER:"
echo "1. Sube estos cambios a tu repositorio (git add, commit, push)."
echo "2. En tu plataforma (Vercel o Render), agrega la variable:"
echo "   Key: VITE_GEMINI_API_KEY"
echo "   Value: (Tu clave de Google AI Studio)"
echo ""
echo "CONFIGURACIÓN ESPECÍFICA:"
echo "- VERCEL: Se ha creado vercel.json para manejar las rutas (SPA)."
echo "- RENDER: Se ha creado render.yaml. Al crear el servicio en Render,"
echo "          selecciona 'Static Site' y usa 'npm run build' como build command"
echo "          y 'dist' como publish directory."
echo "--------------------------------------------------------"
