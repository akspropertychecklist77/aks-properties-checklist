import fs from 'fs';
import path from 'path';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  WidthType, 
  ShadingType 
} from 'docx';

const NAVY = '0F172A';
const GOLD = 'D97706';
const LIGHT_BG = 'F8FAFC';
const BORDER_COLOR = 'CBD5E1';
const TEXT_MUTED = '475569';

function parseInlineFormatting(text) {
  const runs = [];
  // Regex to match bold (**text**), italic (*text*), code (`text`), or plain text
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|[^*`]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const chunk = match[0];
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      runs.push(new TextRun({
        text: chunk.slice(2, -2),
        bold: true,
        font: 'Segoe UI',
      }));
    } else if (chunk.startsWith('*') && chunk.endsWith('*')) {
      runs.push(new TextRun({
        text: chunk.slice(1, -1),
        italics: true,
        font: 'Segoe UI',
      }));
    } else if (chunk.startsWith('`') && chunk.endsWith('`')) {
      runs.push(new TextRun({
        text: chunk.slice(1, -1),
        font: 'Consolas',
        size: 19,
        color: 'B45309',
        shading: {
          type: ShadingType.CLEAR,
          fill: 'FEF3C7',
        },
      }));
    } else {
      runs.push(new TextRun({
        text: chunk,
        font: 'Segoe UI',
      }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, font: 'Segoe UI' })];
}

function markdownToDocxElements(mdContent) {
  const lines = mdContent.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockLines = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle Code Blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockLines.join('\n');
        elements.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
                      left: { style: BorderStyle.SINGLE, size: 24, color: GOLD },
                      right: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
                    },
                    margins: { top: 140, bottom: 140, left: 200, right: 140 },
                    children: codeBlockLines.map(
                      cLine =>
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: cLine || ' ',
                              font: 'Consolas',
                              size: 18,
                              color: 'E2E8F0',
                            }),
                          ],
                          spacing: { before: 40, after: 40 },
                        })
                    ),
                  }),
                ],
              }),
            ],
          })
        );
        elements.push(new Paragraph({ spacing: { after: 120 } }));
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Handle Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      // Skip separator rows (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue;
      }
      const rawCols = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      tableRows.push(rawCols);
      continue;
    } else if (inTable) {
      // Table ended
      if (tableRows.length > 0) {
        const isHeader = true;
        const docxRows = tableRows.map((rowCols, rowIndex) => {
          const isRowHeader = rowIndex === 0;
          return new TableRow({
            tableHeader: isRowHeader,
            children: rowCols.map(
              cellText =>
                new TableCell({
                  shading: isRowHeader
                    ? { type: ShadingType.CLEAR, fill: NAVY }
                    : rowIndex % 2 === 1
                    ? { type: ShadingType.CLEAR, fill: LIGHT_BG }
                    : { type: ShadingType.CLEAR, fill: 'FFFFFF' },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                    left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                    right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                  },
                  margins: { top: 120, bottom: 120, left: 140, right: 140 },
                  children: [
                    new Paragraph({
                      children: isRowHeader
                        ? [
                            new TextRun({
                              text: cellText,
                              bold: true,
                              color: 'FFFFFF',
                              font: 'Segoe UI',
                              size: 19,
                            }),
                          ]
                        : parseInlineFormatting(cellText),
                      spacing: { before: 40, after: 40 },
                    }),
                  ],
                })
            ),
          });
        });

        elements.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: docxRows,
          })
        );
        elements.push(new Paragraph({ spacing: { after: 120 } }));
      }
      inTable = false;
      tableRows = [];
    }

    // Handle Blank Lines
    if (trimmed === '') {
      continue;
    }

    // Handle Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: BORDER_COLOR },
          },
          spacing: { before: 120, after: 180 },
        })
      );
      continue;
    }

    // Handle Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [
            new TextRun({
              text: trimmed.slice(2),
              bold: true,
              color: NAVY,
              font: 'Segoe UI',
              size: 44,
            }),
          ],
          spacing: { before: 200, after: 120 },
        })
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD },
          },
          children: [
            new TextRun({
              text: trimmed.slice(3),
              bold: true,
              color: NAVY,
              font: 'Segoe UI',
              size: 32,
            }),
          ],
          spacing: { before: 300, after: 120 },
        })
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: trimmed.slice(4),
              bold: true,
              color: GOLD,
              font: 'Segoe UI',
              size: 26,
            }),
          ],
          spacing: { before: 200, after: 80 },
        })
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: trimmed.slice(5),
              bold: true,
              color: TEXT_MUTED,
              font: 'Segoe UI',
              size: 22,
            }),
          ],
          spacing: { before: 160, after: 60 },
        })
      );
      continue;
    }

    // Handle Bullet Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.slice(2);
      elements.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineFormatting(bulletText),
          spacing: { before: 40, after: 40 },
        })
      );
      continue;
    }

    // Handle Numbered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${numMatch[1]}. `,
              bold: true,
              font: 'Segoe UI',
              color: GOLD,
            }),
            ...parseInlineFormatting(numMatch[2]),
          ],
          spacing: { before: 40, after: 40 },
        })
      );
      continue;
    }

    // Regular Paragraph
    elements.push(
      new Paragraph({
        children: parseInlineFormatting(trimmed),
        spacing: { before: 60, after: 60 },
        lineSpacing: 276, // 1.15 line spacing
      })
    );
  }

  // If table was at the end of file
  if (inTable && tableRows.length > 0) {
    const docxRows = tableRows.map((rowCols, rowIndex) => {
      const isRowHeader = rowIndex === 0;
      return new TableRow({
        tableHeader: isRowHeader,
        children: rowCols.map(
          cellText =>
            new TableCell({
              shading: isRowHeader
                ? { type: ShadingType.CLEAR, fill: NAVY }
                : { type: ShadingType.CLEAR, fill: 'FFFFFF' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
              },
              children: [
                new Paragraph({
                  children: parseInlineFormatting(cellText),
                }),
              ],
            })
        ),
      });
    });
    elements.push(new Table({ rows: docxRows }));
  }

  return elements;
}

async function convertFile(inputMdPath, outputDocxPath, title, subtitle) {
  console.log(`Reading: ${inputMdPath}`);
  const mdContent = fs.readFileSync(inputMdPath, 'utf8');

  // Header Cover Table
  const headerCover = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: NAVY },
            margins: { top: 300, bottom: 300, left: 300, right: 300 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 24, color: GOLD },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AKS LEGAL OPERATIONS & TECHNOLOGY DESK',
                    bold: true,
                    color: GOLD,
                    font: 'Segoe UI',
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    color: 'FFFFFF',
                    font: 'Segoe UI',
                    size: 38,
                  }),
                ],
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: subtitle,
                    color: '94A3B8',
                    font: 'Segoe UI',
                    size: 22,
                  }),
                ],
                spacing: { after: 60 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const parsedElements = markdownToDocxElements(mdContent);

  const doc = new Document({
    creator: 'Advocate A.K. Saravanan Legal Operations',
    title: title,
    description: subtitle,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          headerCover,
          new Paragraph({ spacing: { after: 240 } }),
          ...parsedElements,
        ],
      },
    ],
  });

  console.log(`Packing into DOCX: ${outputDocxPath}`);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputDocxPath, buffer);
  console.log(`✓ Successfully generated: ${outputDocxPath} (${Math.round(buffer.length / 1024)} KB)`);
}

function safeCopy(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Mirrored to: ${dest}`);
  } catch (err) {
    console.warn(`Notice: Could not copy to ${dest} (${err.message}). Source file is ready at ${src}`);
  }
}

async function main() {
  const checklistDocsDir = path.join(process.cwd(), 'docs');
  const portalDocsDir = 'C:\\aks-property-portal\\docs';

  // 1. Technical Architecture Document
  const tadMd = path.join(checklistDocsDir, 'TECHNICAL_ARCHITECTURE_DOCUMENT.md');
  const tadDocxChecklist = path.join(checklistDocsDir, 'TECHNICAL_ARCHITECTURE_DOCUMENT.docx');
  const tadDocxPortal = path.join(portalDocsDir, 'TECHNICAL_ARCHITECTURE_DOCUMENT.docx');

  await convertFile(
    tadMd,
    tadDocxChecklist,
    'TECHNICAL ARCHITECTURE DOCUMENT',
    'Edge-First Serverless Legal Tech Architecture for Property Title Verification'
  );
  safeCopy(tadDocxChecklist, tadDocxPortal);

  // 2. Functional Requirements Document
  const frdMd = path.join(checklistDocsDir, 'FUNCTIONAL_REQUIREMENTS_DOCUMENT.md');
  const frdDocxChecklist = path.join(checklistDocsDir, 'FUNCTIONAL_REQUIREMENTS_DOCUMENT.docx');
  const frdDocxPortal = path.join(portalDocsDir, 'FUNCTIONAL_REQUIREMENTS_DOCUMENT.docx');

  await convertFile(
    frdMd,
    frdDocxChecklist,
    'FUNCTIONAL REQUIREMENTS DOCUMENT (SRS)',
    'IEEE 830 Specification for Tamil Nadu 8-Stage Property Title Verification'
  );
  safeCopy(frdDocxChecklist, frdDocxPortal);

  // 3. Database Design Document
  const dddMd = path.join(checklistDocsDir, 'DATABASE_DESIGN_DOCUMENT.md');
  const dddDocxChecklist = path.join(checklistDocsDir, 'DATABASE_DESIGN_DOCUMENT.docx');
  const dddDocxPortal = path.join(portalDocsDir, 'DATABASE_DESIGN_DOCUMENT.docx');

  await convertFile(
    dddMd,
    dddDocxChecklist,
    'DATABASE DESIGN DOCUMENT (DDD)',
    'Relational Schema, D1 Edge Storage & Polyglot Architecture Specification'
  );
  safeCopy(dddDocxChecklist, dddDocxPortal);

  // 4. Enterprise Solution Architecture Blueprint
  const sadMd = path.join(checklistDocsDir, 'ENTERPRISE_SOLUTION_ARCHITECTURE_BLUEPRINT.md');
  const sadDocxChecklist = path.join(checklistDocsDir, 'ENTERPRISE_SOLUTION_ARCHITECTURE_BLUEPRINT.docx');
  const sadDocxPortal = path.join(portalDocsDir, 'ENTERPRISE_SOLUTION_ARCHITECTURE_BLUEPRINT.docx');

  await convertFile(
    sadMd,
    sadDocxChecklist,
    'ENTERPRISE SOLUTION ARCHITECTURE DOCUMENT (SAD)',
    'Metadata-Driven Dynamic Web Application Platform & Technical Blueprint'
  );
  safeCopy(sadDocxChecklist, sadDocxPortal);

  // 5. Detailed Technical Design Specification
  const dtsMd = path.join(checklistDocsDir, 'DETAILED_TECHNICAL_DESIGN_SPECIFICATION.md');
  const dtsDocxChecklist = path.join(checklistDocsDir, 'DETAILED_TECHNICAL_DESIGN_SPECIFICATION.docx');
  const dtsDocxPortal = path.join(portalDocsDir, 'DETAILED_TECHNICAL_DESIGN_SPECIFICATION.docx');

  await convertFile(
    dtsMd,
    dtsDocxChecklist,
    'DETAILED TECHNICAL DESIGN SPECIFICATION (DTS)',
    'Step 2: Metadata-Driven Dynamic Engine, API Contracts & Security Implementation'
  );
  safeCopy(dtsDocxChecklist, dtsDocxPortal);

  // 6. Testing, Deployment & DevOps Specification
  const tdsMd = path.join(checklistDocsDir, 'TESTING_AND_DEPLOYMENT_SPECIFICATION.md');
  const tdsDocxChecklist = path.join(checklistDocsDir, 'TESTING_AND_DEPLOYMENT_SPECIFICATION.docx');
  const tdsDocxPortal = path.join(portalDocsDir, 'TESTING_AND_DEPLOYMENT_SPECIFICATION.docx');

  await convertFile(
    tdsMd,
    tdsDocxChecklist,
    'TESTING, DEPLOYMENT & DEVOPS SPECIFICATION (TDS)',
    'Step 4: Enterprise Quality Engineering, Automated Verification, CI/CD & Runbook'
  );
  safeCopy(tdsDocxChecklist, tdsDocxPortal);

  // 7. Enterprise UI/UX Design Specification
  const udsMd = path.join(checklistDocsDir, 'ENTERPRISE_UI_UX_DESIGN_SPECIFICATION.md');
  const udsDocxChecklist = path.join(checklistDocsDir, 'ENTERPRISE_UI_UX_DESIGN_SPECIFICATION.docx');
  const udsDocxPortal = path.join(portalDocsDir, 'ENTERPRISE_UI_UX_DESIGN_SPECIFICATION.docx');

  await convertFile(
    udsMd,
    udsDocxChecklist,
    'ENTERPRISE UI/UX ARCHITECTURE & DESIGN SPECIFICATION (UDS)',
    'Modern Enterprise Legal-Tech SaaS Design System, Wireframes & Information Architecture'
  );
  safeCopy(udsDocxChecklist, udsDocxPortal);

  console.log('\nAll Word documents generated successfully in both projects!');
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});

