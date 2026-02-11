// Pending documents store using localStorage
// In production, this would be a database

export interface PendingDocument {
  id: string;
  title: string;
  majorId: string;
  subjectId: string;
  documentType: 'EXAM' | 'SLIDE' | 'TEXTBOOK';
  fileType: string;
  fileSize: string;
  fileName: string;
  uploadDate: string;
  uploaderName?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const STORAGE_KEY = 'pendingDocuments';

export function getPendingDocuments(): PendingDocument[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addPendingDocument(doc: Omit<PendingDocument, 'id' | 'uploadDate' | 'status'>): PendingDocument {
  const documents = getPendingDocuments();
  const newDoc: PendingDocument = {
    ...doc,
    id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  };
  documents.push(newDoc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  return newDoc;
}

export function approveDocument(id: string): boolean {
  const documents = getPendingDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  if (index === -1) return false;
  
  documents[index].status = 'approved';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  
  // In a real app, this would add to the main documents list
  // For now, we just mark it as approved
  return true;
}

export function rejectDocument(id: string): boolean {
  const documents = getPendingDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  if (index === -1) return false;
  
  documents[index].status = 'rejected';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  return true;
}

export function deletePendingDocument(id: string): boolean {
  const documents = getPendingDocuments();
  const filtered = documents.filter(doc => doc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getPendingCount(): number {
  return getPendingDocuments().filter(doc => doc.status === 'pending').length;
}
