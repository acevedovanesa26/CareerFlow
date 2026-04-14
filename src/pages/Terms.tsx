import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <PageHeader 
          title="Términos y Condiciones" 
          description="Última actualización: 12 de abril de 2026"
        />
        
        <Card>
          <CardContent className="prose prose-zinc max-w-none p-8">
            <h3>1. Aceptación de los Términos</h3>
            <p>
              Al acceder y utilizar CareerFlow AI, usted acepta estar sujeto a estos Términos y Condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros servicios.
            </p>

            <h3>2. Uso del Servicio</h3>
            <p>
              Nuestra plataforma utiliza Inteligencia Artificial para asistir en la creación de documentos profesionales 
              y simulaciones de entrevistas. Usted es responsable de la veracidad de la información proporcionada y 
              de la revisión final de cualquier contenido generado por la IA.
            </p>

            <h3>3. Cuentas de Usuario</h3>
            <p>
              Para utilizar ciertas funciones, debe registrarse a través de una cuenta de Google. Usted es responsable 
              de mantener la seguridad de su cuenta y de todas las actividades que ocurran bajo ella.
            </p>

            <h3>4. Propiedad Intelectual</h3>
            <p>
              El software, diseño y algoritmos de CareerFlow AI son propiedad exclusiva de la empresa. Los documentos 
              generados por el usuario para su uso personal o profesional pertenecen al usuario.
            </p>

            <h3>5. Limitación de Responsabilidad</h3>
            <p>
              CareerFlow AI no garantiza el éxito en procesos de contratación. El servicio se proporciona "tal cual" 
              y no nos hacemos responsables de decisiones tomadas basadas en el contenido generado por la IA.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
