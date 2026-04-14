import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <PageHeader 
          title="Política de Privacidad" 
          description="Tu privacidad es nuestra prioridad."
        />
        
        <Card>
          <CardContent className="prose prose-zinc max-w-none p-8">
            <h3>1. Información que Recopilamos</h3>
            <p>
              Recopilamos información básica de su perfil de Google (nombre, correo electrónico, foto) cuando inicia sesión. 
              También almacenamos los datos que usted introduce para generar CVs, documentos y sus historiales de entrevistas.
            </p>

            <h3>2. Uso de la Información</h3>
            <p>
              Utilizamos sus datos exclusivamente para:
            </p>
            <ul>
              <li>Proporcionar y mejorar nuestros servicios de IA.</li>
              <li>Personalizar su experiencia en el dashboard.</li>
              <li>Mantener la seguridad de su cuenta.</li>
            </ul>

            <h3>3. Protección de Datos</h3>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra 
              acceso no autorizado, pérdida o alteración. Sus datos se almacenan de forma segura en Google Cloud / Firebase.
            </p>

            <h3>4. Compartir Información</h3>
            <p>
              No vendemos ni alquilamos sus datos personales a terceros. Solo compartimos información cuando es 
              estrictamente necesario para procesar las solicitudes de IA a través de los servicios de Google Gemini.
            </p>

            <h3>5. Sus Derechos</h3>
            <p>
              Usted tiene derecho a acceder, rectificar o eliminar sus datos en cualquier momento a través de la 
              configuración de su cuenta o contactando con nuestro equipo de soporte.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
