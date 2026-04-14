import * as React from "react";
import { CVData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Award } from "lucide-react";

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  return (
    <Card className="bg-white shadow-lg border-none min-h-[800px] text-zinc-800 font-sans p-8 md:p-12 overflow-hidden">
      <CardContent className="p-0 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark uppercase">
            {data.personalInfo.fullName || "Tu Nombre Completo"}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
            {data.personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {data.personalInfo.email}
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {data.personalInfo.phone}
              </div>
            )}
            {data.personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {data.personalInfo.location}
              </div>
            )}
          </div>
          {data.personalInfo.summary && (
            <p className="text-zinc-700 leading-relaxed text-sm italic border-l-4 border-brand-medium pl-4 py-1">
              {data.personalInfo.summary}
            </p>
          )}
        </div>

        <Separator />

        {/* Experience */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-brand-dark font-bold uppercase tracking-wider">
            <Briefcase className="h-5 w-5" />
            <h2>Experiencia Laboral</h2>
          </div>
          <div className="space-y-6">
            {data.experience.length > 0 ? data.experience.map((exp, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <p className="text-brand-medium font-medium">{exp.company}</p>
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            )) : (
              <p className="text-zinc-400 text-sm italic">Agrega tu experiencia laboral...</p>
            )}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-brand-dark font-bold uppercase tracking-wider">
            <GraduationCap className="h-5 w-5" />
            <h2>Educación</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.education.length > 0 ? data.education.map((edu, i) => (
              <div key={i} className="space-y-1">
                <h3 className="font-bold">{edu.degree}</h3>
                <p className="text-sm text-brand-medium">{edu.school}</p>
                <p className="text-xs text-zinc-500">{edu.year}</p>
              </div>
            )) : (
              <p className="text-zinc-400 text-sm italic">Agrega tu formación académica...</p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-brand-dark font-bold uppercase tracking-wider">
            <Award className="h-5 w-5" />
            <h2>Habilidades</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.length > 0 ? data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium border border-zinc-200">
                {skill}
              </span>
            )) : (
              <p className="text-zinc-400 text-sm italic">Agrega tus habilidades...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
