import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'shop';
  text: string;
  time: string;
  createdAt?: any;
}

export interface ChatSession {
  id: string;
  shopId: string;
  shopName: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastUpdated: string;
  unreadCountShop: number;
  unreadCountUser: number;
}

/**
 * Get or create a chat session between a user and a shop
 */
export async function getOrCreateChatSession(
  shopId: string,
  shopName: string,
  userId: string,
  userName: string
): Promise<string> {
  const chatId = `${shopId}_${userId}`;
  const chatRef = doc(db, 'shopChats', chatId);
  try {
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        shopId,
        shopName,
        userId,
        userName,
        lastMessage: 'Chat opened',
        unreadCountShop: 0,
        unreadCountUser: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Could not initialize chat session doc in Firestore, continuing locally:', err);
  }
  return chatId;
}

/**
 * Send a message in a shop chat
 */
export async function sendChatMessage(
  chatId: string,
  message: {
    senderId: string;
    senderName: string;
    senderType: 'user' | 'shop';
    text: string;
  }
): Promise<boolean> {
  try {
    const chatRef = doc(db, 'shopChats', chatId);
    const messagesCol = collection(db, 'shopChats', chatId, 'messages');

    await addDoc(messagesCol, {
      ...message,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      chatRef,
      {
        lastMessage: message.text,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to send Firestore chat message:', err);
    return false;
  }
}

/**
 * Fetch all chat sessions for a specific shop owner
 */
export async function fetchShopChats(shopId: string): Promise<ChatSession[]> {
  try {
    const q = query(
      collection(db, 'shopChats'),
      where('shopId', '==', shopId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        shopId: data.shopId || shopId,
        shopName: data.shopName || '',
        userId: data.userId || '',
        userName: data.userName || 'Customer',
        lastMessage: data.lastMessage || '',
        lastUpdated: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
        unreadCountShop: data.unreadCountShop || 0,
        unreadCountUser: data.unreadCountUser || 0,
      };
    });
  } catch (err) {
    console.warn('Error fetching shop chats:', err);
    return [];
  }
}
