import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SupportTicket } from '../types';

/**
 * Submit a new complaint, feedback, or suggestion
 */
export async function createSupportTicket(ticketData: {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  type: 'complaint' | 'feedback' | 'suggestion';
  subject: string;
  message: string;
}): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'supportTickets'), {
      ...ticketData,
      status: 'pending',
      adminReply: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('Failed to submit support ticket:', err);
    return { success: false, id: '', error: err?.message || 'Submission failed' };
  }
}

/**
 * Fetch tickets submitted by a specific user
 */
export async function fetchUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || userId,
        userName: data.userName || 'Member',
        userEmail: data.userEmail || '',
        userPhone: data.userPhone || '',
        type: data.type || 'feedback',
        subject: data.subject || '',
        message: data.message || '',
        status: data.status || 'pending',
        adminReply: data.adminReply || '',
        adminRepliedAt: data.adminRepliedAt ? new Date(data.adminRepliedAt.seconds * 1000).toISOString() : undefined,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Error fetching user support tickets:', err);
    return [];
  }
}

/**
 * Fetch all support tickets for Admin moderation
 */
export async function fetchAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || '',
        userName: data.userName || 'Member',
        userEmail: data.userEmail || '',
        userPhone: data.userPhone || '',
        type: data.type || 'feedback',
        subject: data.subject || '',
        message: data.message || '',
        status: data.status || 'pending',
        adminReply: data.adminReply || '',
        adminRepliedAt: data.adminRepliedAt ? new Date(data.adminRepliedAt.seconds * 1000).toISOString() : undefined,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Error fetching all support tickets:', err);
    return [];
  }
}

/**
 * Admin reply and status update on a support ticket
 */
export async function replyToSupportTicket(
  ticketId: string,
  replyText: string,
  status: 'pending' | 'in_review' | 'resolved' | 'closed' = 'resolved'
): Promise<boolean> {
  try {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await updateDoc(ticketRef, {
      adminReply: replyText,
      adminRepliedAt: serverTimestamp(),
      status: status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('Failed to reply to ticket:', err);
    return false;
  }
}
