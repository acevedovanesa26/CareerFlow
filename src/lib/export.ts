import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

// Helper to sanitize text for PDF/Word
const sanitizeText = (text: string) => text.replace(/[^\x00-\x7F]/g, "");

export async function exportCVToWord(data: any, fileName: string = 'curriculum.docx') {
  try {
    const sections = [];
    
    // Header Section
    sections.push(
      new Paragraph({
        text: (data.personal.fullName || 'CURRICULUM VITAE').toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Perfil
    if (data.perfil) {
      sections.push(
        new Paragraph({ text: "PERFIL PROFESIONAL", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: data.perfil, spacing: { after: 300 } })
      );
    }

    // Experiencia
    if (data.experience?.length > 0) {
      sections.push(new Paragraph({ text: "EXPERIENCIA LABORAL", heading: HeadingLevel.HEADING_2 }));
      data.experience.forEach((exp: any) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.position, bold: true }),
              new TextRun({ text: ` en ${exp.company}` }),
              new TextRun({ text: ` (${exp.start} - ${exp.current ? 'Actual' : exp.end})`, italics: true }),
            ]
          }),
          new Paragraph({ text: exp.desc, spacing: { after: 200 } })
        );
      });
    }

    // Habilidades
    sections.push(new Paragraph({ text: "HABILIDADES", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    if (data.skills?.length > 0) {
      sections.push(new Paragraph({ text: `Técnicas: ${data.skills.join(', ')}` }));
    }
    if (data.soft_skills?.length > 0) {
      sections.push(new Paragraph({ text: `Blandas: ${data.soft_skills.join(', ')}` }));
    }

    // Idiomas
    if (data.languages?.length > 0) {
      sections.push(new Paragraph({ text: "IDIOMAS", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      data.languages.forEach((lang: any) => {
        sections.push(new Paragraph({ text: `${lang.name} - ${lang.level}` }));
      });
    }

    // Educación
    if (data.education?.length > 0) {
      sections.push(new Paragraph({ text: "EDUCACIÓN", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      data.education.forEach((edu: any) => {
        sections.push(
          new Paragraph({ text: `${edu.degree} - ${edu.school} (${edu.year})` })
        );
      });
    }

    // Certificaciones
    if (data.certifications?.length > 0) {
      sections.push(new Paragraph({ text: "CERTIFICACIONES", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      data.certifications.forEach((cert: any) => {
        sections.push(new Paragraph({ text: `${cert.name} - ${cert.issuer}` }));
      });
    }

    // Proyectos
    if (data.projects?.length > 0) {
      sections.push(new Paragraph({ text: "PROYECTOS DESTACADOS", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      data.projects.forEach((proj: any) => {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: proj.title, bold: true })] }),
          new Paragraph({ text: proj.desc, spacing: { after: 150 } })
        );
      });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: sections,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
    toast.success('Archivo Word generado correctamente');
  } catch (error) {
    console.error("Word export failed:", error);
    toast.error('Error al generar el archivo Word');
  }
}

export async function exportToWord(title: string, content: string, fileName: string = 'documento.docx') {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          ...content.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            
            // Basic formatting detection
            const isHeading = trimmed.startsWith('#');
            const cleanText = trimmed.replace(/^#+\s*/, '');
            
            return new Paragraph({
              children: [new TextRun({
                text: cleanText,
                bold: isHeading,
                size: isHeading ? 28 : 22
              })],
              spacing: { before: 120, after: 120 },
              heading: isHeading ? HeadingLevel.HEADING_2 : undefined
            });
          }).filter(Boolean) as Paragraph[]
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
    toast.success('Documento Word generado correctamente');
  } catch (error) {
    console.error("Simple Word export failed:", error);
    toast.error('Error al generar el archivo Word');
  }
}

export async function exportToPDF(title: string, content: string, fileName: string = 'documento.pdf') {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 105, 20, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const splitContent = doc.splitTextToSize(content, 180);
  doc.text(splitContent, 15, 40);
  
  doc.save(fileName);
}

export async function exportReportToPDF(title: string, data: any, fileName: string = 'reporte_desempeño.pdf') {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(34, 197, 94); // brand-bright color approx
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(title.toUpperCase(), 105, 20, { align: 'center' });
  
  // Content
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(16);
  doc.text("Resumen de Actividad", 20, 45);
  
  doc.setFontSize(12);
  let y = 60;
  
  if (Array.isArray(data)) {
    data.forEach((item: any) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${item.label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${item.value}`, 80, y);
      y += 10;
    });
  } else {
    Object.entries(data).forEach(([key, val]: [string, any]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${key}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${val}`, 80, y);
      y += 10;
    });
  }
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.save(fileName);
}

export async function exportElementToPDF(element: HTMLElement, fileName: string = 'curriculum.pdf') {
  const toastId = toast.loading('Generando PDF...');
  try {
    // Ensure the element has dimensions
    const elementWidth = element.offsetWidth || 800;
    const elementHeight = element.scrollHeight || 1000;

    if (elementWidth === 0 || elementHeight === 0) {
      throw new Error("El elemento de vista previa no tiene dimensiones visibles.");
    }

    // Scroll to top for capture
    window.scrollTo(0, 0);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1024,
      onclone: (clonedDoc) => {
        // High-level cleanup: Remove or fix stylesheets containing oklch/oklab before html2canvas parses them deeply
        // This is crucial because html2canvas's CSS parser crashes on oklch
        const sheets = clonedDoc.querySelectorAll('style');
        sheets.forEach(s => {
          if (s.innerHTML.includes('oklch') || s.innerHTML.includes('oklab')) {
            // Replace with a neutral hex or remove the problematic rules
            // We use a safe replacement to avoid parser crashes
            s.innerHTML = s.innerHTML
              .replace(/oklch\([^)]+\)/g, '#374151') // Standard dark gray fallback
              .replace(/oklab\([^)]+\)/g, '#374151');
          }
        });

        // Also handle link tags by neutralizing them if they are from the same origin or known to have oklch
        const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(l => {
          // If we can't easily sanitize links, we at least ensure our overrides are stronger
          // But usually linked styles also contribute to the crash
          try {
             // For any linked stylesheet, we might want to disable it if it's the main tailwind one,
             // as we provide exhaustive overrides below.
             if (l.getAttribute('href')?.includes('tailwind')) {
               // l.remove(); // Removing might break layout too much
             }
          } catch(e) {}
        });

        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          /* Force standard color space for capture */
          :root {
            color-scheme: light !important;
            --brand-dark: #01204E !important;
            --brand-medium: #028391 !important;
            --brand-bright: #10b981 !important;
            --brand-accent: #F6DCAC !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #cv-preview {
            color: #1e293b !important;
            background-color: #ffffff !important;
            width: 800px !important;
            margin: 0 auto !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          #cv-preview * {
            border-color: #e2e8f0 !important;
          }
          .no-pdf { display: none !important; }
        `;
        clonedDoc.head.appendChild(style);

        const el = clonedDoc.getElementById('cv-preview');
        if (el) {
          el.style.transform = 'none';
          el.style.padding = '40px';
          el.style.margin = '0 auto';
          el.style.backgroundColor = '#ffffff';
          el.style.boxShadow = 'none';
          el.style.maxHeight = 'none';
          el.style.height = 'auto';
          el.classList.remove('dark');
          el.style.color = '#1e293b';
          
          // Deep clean: find all elements with modern colors and replace them
          const walker = clonedDoc.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
          let node = walker.nextNode() as HTMLElement;
          while (node) {
            const computed = window.getComputedStyle(node);
            ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'textDecorationColor', 'fill', 'stroke'].forEach(prop => {
              const val = node.style.getPropertyValue(prop) || computed.getPropertyValue(prop);
              if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('var('))) {
                // Determine a safe fallback
                if (prop === 'backgroundColor') {
                  if (node.classList.contains('bg-brand-dark')) node.style.backgroundColor = '#01204E';
                  else if (node.classList.contains('bg-brand-bright')) node.style.backgroundColor = '#10b981';
                  else if (node.classList.contains('bg-brand-medium')) node.style.backgroundColor = '#028391';
                  else node.style.backgroundColor = 'transparent';
                } else if (prop === 'color') {
                  if (node.classList.contains('text-brand-bright')) node.style.color = '#10b981';
                  else if (node.classList.contains('text-brand-dark')) node.style.color = '#01204E';
                  else node.style.color = '#1e293b';
                } else {
                  node.style.setProperty(prop, '#cccccc', 'important');
                }
              }
            });
            node = walker.nextNode() as HTMLElement;
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    if (imgWidth === 0 || imgHeight === 0) throw new Error("Error renderizando el documento (canvas vacío)");
    
    const ratio = imgWidth / imgHeight;
    const finalWidth = pdfWidth;
    const finalHeight = pdfWidth / ratio;
    
    if (finalHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight, undefined, 'FAST');
    } else {
      let heightLeft = finalHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, finalWidth, finalHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - finalHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, finalWidth, finalHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }
    
    pdf.save(fileName);
    toast.success('PDF descargado', { id: toastId });
  } catch (error: any) {
    console.error("PDF Export failed:", error);
    toast.error(error.message || "Error al exportar PDF", { id: toastId });
  }
}

export function exportToExcel(sheets: { name: string, data: any[] }[], fileName: string = 'reporte.xlsx') {
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    
    // Simple styling for headers (XLSX basic doesn't support complex styling easily without xlsx-js-style)
    // But we can at least format the structure.
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  XLSX.writeFile(wb, fileName);
}
