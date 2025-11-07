
// This makes TypeScript aware of the global objects injected by the script tags
declare const mammoth: any;
declare const pdfjsLib: any;

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;


export async function extractText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return extractTextFromPdf(file);
    case 'docx':
      return extractTextFromDocx(file);
    case 'txt':
      return extractTextFromTxt(file);
    default:
      throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
  }
}

function extractTextFromTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(new Error('Failed to read TXT file.'));
    };
    reader.readAsText(file);
  });
}

function extractTextFromDocx(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target?.result;
                if (!arrayBuffer) {
                    throw new Error('Could not read DOCX file buffer.');
                }
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                resolve(result.value);
            } catch (error) {
                console.error('Mammoth.js error:', error);
                reject(new Error('Failed to parse DOCX file.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read DOCX file.'));
        };
        reader.readAsArrayBuffer(file);
    });
}


async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textContent = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return textContent;
}
