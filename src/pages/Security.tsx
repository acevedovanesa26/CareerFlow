import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { ShieldCheck, Lock, EyeOff, Server } from "lucide-react";

export default function Security() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <PageHeader 
          title="Seguridad de la Información" 
          description="Estándares de seguridad de clase mundial para proteger tu carrera."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="w-6 h-6 text-green-700" />
              </div>
              <CardTitle className="text-lg">Encriptación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Todos los datos se transmiten mediante protocolos HTTPS/TLS cifrados y se almacenan con encriptación en reposo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-blue-700" />
              </div>
              <CardTitle className="text-lg">Autenticación Segura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Utilizamos Firebase Auth y Google OAuth para garantizar que solo tú tengas acceso a tu información personal.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="prose prose-zinc max-w-none p-8">
            <h3>Nuestra Infraestructura</h3>
            <p>
              CareerFlow AI se ejecuta sobre la infraestructura global de Google Cloud, beneficiándose de años de 
              experiencia en seguridad física y digital.
            </p>
            
            <h3>Monitoreo Continuo</h3>
            <p>
              Realizamos auditorías de seguridad periódicas y monitoreamos nuestros sistemas 24/7 para detectar 
              y prevenir cualquier actividad sospechosa.
            </p>

            <h3>Privacidad de la IA</h3>
            <p>
              Tus datos de entrenamiento no se utilizan para entrenar modelos públicos de IA sin tu consentimiento 
              explícito. La interacción con Gemini API es privada y segura.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
