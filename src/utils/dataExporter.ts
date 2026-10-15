import { localDb } from '@/database/db';

export interface StudBackupPayload {
  version: string;
  exported_at: string;
  app: string;
  data: {
    phases: any[];
    topics: any[];
    resources: any[];
    project_reminders: any[];
    prds: any[];
    certifications: any[];
    books: any[];
    networking_contacts: any[];
    daily_habits: any[];
    resume_vault: any[];
    focus_sessions: any[];
    applications: any[];
  };
}

export const exportAllData = async (): Promise<string> => {
  const phases = await localDb.phases.toArray();
  const topics = await localDb.topics.toArray();
  const resources = await localDb.resources.toArray();
  const project_reminders = await localDb.project_reminders.toArray();
  const prds = await localDb.table('prds').toArray();
  const certifications = await localDb.certifications.toArray();
  const books = await localDb.table('books').toArray();
  const networking_contacts = await localDb.table('networking_contacts').toArray();
  const daily_habits = await localDb.daily_habits.toArray();
  const resume_vault = await localDb.table('resume_vault').toArray();
  const focus_sessions = await localDb.table('focus_sessions').toArray();
  const applications = await localDb.table('applications').toArray();

  const payload: StudBackupPayload = {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    app: 'Stud Career Operating System',
    data: {
      phases,
      topics,
      resources,
      project_reminders,
      prds,
      certifications,
      books,
      networking_contacts,
      daily_habits,
      resume_vault,
      focus_sessions,
      applications,
    },
  };

  return JSON.stringify(payload, null, 2);
};

export const importData = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
  try {
    const payload: StudBackupPayload = JSON.parse(jsonString);
    if (!payload.data || !payload.app?.includes('Stud')) {
      return { success: false, message: 'Invalid Stud backup JSON file schema.' };
    }

    const { data } = payload;

    if (Array.isArray(data.phases)) await localDb.phases.bulkPut(data.phases);
    if (Array.isArray(data.topics)) await localDb.topics.bulkPut(data.topics);
    if (Array.isArray(data.resources)) await localDb.resources.bulkPut(data.resources);
    if (Array.isArray(data.project_reminders)) await localDb.project_reminders.bulkPut(data.project_reminders);
    if (Array.isArray(data.prds)) await localDb.table('prds').bulkPut(data.prds);
    if (Array.isArray(data.certifications)) await localDb.certifications.bulkPut(data.certifications);
    if (Array.isArray(data.books)) await localDb.table('books').bulkPut(data.books);
    if (Array.isArray(data.networking_contacts)) await localDb.table('networking_contacts').bulkPut(data.networking_contacts);
    if (Array.isArray(data.daily_habits)) await localDb.daily_habits.bulkPut(data.daily_habits);
    if (Array.isArray(data.resume_vault)) await localDb.table('resume_vault').bulkPut(data.resume_vault);
    if (Array.isArray(data.focus_sessions)) await localDb.table('focus_sessions').bulkPut(data.focus_sessions);
    if (Array.isArray(data.applications)) await localDb.table('applications').bulkPut(data.applications);

    return { success: true, message: 'Data backup successfully restored!' };
  } catch (e: any) {
    return { success: false, message: `Failed to import JSON: ${e?.message || 'Syntax error'}` };
  }
};
