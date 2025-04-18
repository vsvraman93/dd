import ExcelJS from 'exceljs';
import { 
  Project, 
  Category, 
  Question, 
  Response, 
  Attachment, 
  Comment 
} from '@/types/database';

// Extended type with related data
interface ProjectWithData extends Project {
  categories: (Category & {
    questions: (Question & {
      responses: (Response & {
        attachments: Attachment[];
        comments: Comment[];
        user_email?: string;
      })[];
    })[];
  })[];
  team: Array<{
    email: string;
    role: string;
    id: string;
  }>;
}

export const generateProjectExcel = async (projectData: ProjectWithData): Promise<Blob> => {
  const workbook = new ExcelJS.Workbook();
  
  // Project overview sheet
  const overviewSheet = workbook.addWorksheet('Project Overview');
  
  overviewSheet.columns = [
    { header: 'Property', key: 'property', width: 20 },
    { header: 'Value', key: 'value', width: 60 }
  ];
  
  overviewSheet.addRows([
    { property: 'Project Name', value: projectData.name },
    { property: 'Description', value: projectData.description || '' },
    { property: 'Status', value: projectData.status },
    { property: 'Created At', value: new Date(projectData.created_at).toLocaleString() }
  ]);
  
  // Team members sheet
  const teamSheet = workbook.addWorksheet('Team Members');
  
  teamSheet.columns = [
    { header: 'Email', key: 'email', width: 40 },
    { header: 'Role', key: 'role', width: 20 }
  ];
  
  teamSheet.addRows(projectData.team.map(member => ({
    email: member.email,
    role: member.role.charAt(0).toUpperCase() + member.role.slice(1)
  })));
  
  // Questionnaire sheet
  const questionnaireSheet = workbook.addWorksheet('Questionnaire');
  
  questionnaireSheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Question', key: 'question', width: 40 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Response', key: 'response', width: 40 },
    { header: 'Respondent', key: 'respondent', width: 30 },
    { header: 'Attachments', key: 'attachments', width: 30 },
    { header: 'Comments', key: 'comments', width: 40 }
  ];
  
  // Add questionnaire data
  projectData.categories.forEach(category => {
    category.questions.forEach(question => {
      const responses = question.responses;
      
      if (responses.length === 0) {
        // Add row with no response
        questionnaireSheet.addRow({
          category: category.name,
          question: question.question,
          description: question.description || '',
          response: '',
          respondent: '',
          attachments: '',
          comments: ''
        });
      } else {
        // Add a row for each response
        responses.forEach(response => {
          const attachmentsList = response.attachments
            .map(att => att.file_name)
            .join(', ');
            
          const commentsList = response.comments
            .map(comment => `${comment.user_email || 'User'}: ${comment.content}`)
            .join('\n');
          
          questionnaireSheet.addRow({
            category: category.name,
            question: question.question,
            description: question.description || '',
            response: response.response || '',
            respondent: response.user_email || '',
            attachments: attachmentsList,
            comments: commentsList
          });
        });
      }
    });
  });
  
  // Apply styling
  [overviewSheet, teamSheet, questionnaireSheet].forEach(sheet => {
    // Header styling
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add borders
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  });
  
  // Generate blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};