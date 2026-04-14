import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { CVData } from "@/types";

const BRAND_COLOR = "0B3D2E"; // Verde oscuro corporativo

export async function exportCVToWord(data: CVData) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.personalInfo.fullName.toUpperCase(),
                bold: true,
                size: 32,
                color: BRAND_COLOR,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${data.personalInfo.email}  |  ${data.personalInfo.phone}  |  ${data.personalInfo.location}`,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 400 },
          }),
          
          // Profile
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "PERFIL PROFESIONAL",
                bold: true,
                color: BRAND_COLOR,
              }),
            ],
            border: { bottom: { color: BRAND_COLOR, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          new Paragraph({
            text: data.personalInfo.summary,
            spacing: { before: 200, after: 400 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          // Experience
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "EXPERIENCIA LABORAL",
                bold: true,
                color: BRAND_COLOR,
              }),
            ],
            border: { bottom: { color: BRAND_COLOR, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          ...data.experience.flatMap((exp) => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.position, bold: true, size: 24 }),
                new TextRun({ text: `  •  ${exp.company}`, italics: true, size: 22, color: "333333" }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `${exp.startDate} — ${exp.endDate}`, 
                  size: 18, 
                  color: "666666",
                  italics: true 
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: exp.description,
              spacing: { after: 300 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          ]),

          // Education
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "EDUCACIÓN",
                bold: true,
                color: BRAND_COLOR,
              }),
            ],
            border: { bottom: { color: BRAND_COLOR, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          ...data.education.flatMap((edu) => [
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true, size: 24 }),
                new TextRun({ text: `  •  ${edu.school}`, size: 22 }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: edu.year, size: 18, color: "666666", italics: true }),
              ],
            }),
          ]),

          // Skills
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "HABILIDADES",
                bold: true,
                color: BRAND_COLOR,
              }),
            ],
            border: { bottom: { color: BRAND_COLOR, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          new Paragraph({
            text: data.skills.join("  •  "),
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `CV_${data.personalInfo.fullName.replace(/\s+/g, "_")}.docx`);
}

export async function exportDocToWord(title: string, content: string) {
  // Clean markdown artifacts and HTML tags
  const cleanContent = content
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with newlines
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, "")) // Remove code blocks
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // Remove triple asterisks
    .trim();

  const lines = cleanContent.split("\n");
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 36,
          color: BRAND_COLOR,
        }),
      ],
      spacing: { after: 600 },
    }),
  ];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      return;
    }

    // Handle Headers (Markdown ###)
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      children.push(
        new Paragraph({
          heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: text.toUpperCase(),
              bold: true,
              color: BRAND_COLOR,
              size: 28 - (level * 2),
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
      return;
    }

    // Handle lists (Markdown - or *)
    const isList = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
    const listText = isList ? trimmedLine.substring(2) : trimmedLine;

    // Handle bold text (Markdown **text**)
    const parts = listText.split(/(\*\*.*?\*\*)/g);
    const textRuns = parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return new TextRun({
          text: part.replace(/\*\*/g, ""),
          bold: true,
          size: 22,
        });
      }
      return new TextRun({
        text: part,
        size: 22,
      });
    });

    children.push(
      new Paragraph({
        children: textRuns,
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED,
        bullet: isList ? { level: 0 } : undefined,
        indent: isList ? { left: 720, hanging: 360 } : undefined,
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
}
