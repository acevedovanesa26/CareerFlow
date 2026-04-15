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
echo "PASOS A SEGUIR:"
echo "1. Sube estos cambios a tu repositorio (git add, commit, push)."
echo "2. En Vercel, ve a Settings > Environment Variables."
echo "3. Agrega la variable: VITE_GEMINI_API_KEY"
echo "   (Usa tu clave de Google AI Studio)"
echo "4. ¡Haz un Redeploy y disfruta de tu app!"
echo "--------------------------------------------------------"
