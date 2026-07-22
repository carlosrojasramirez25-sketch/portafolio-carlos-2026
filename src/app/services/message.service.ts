import { Injectable } from '@angular/core';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

@Injectable({ providedIn: 'root' })
export class MessageService {

  async sendMessage(message: string) {
    try {
      await addDoc(collection(db, 'mensaje'), {
        message,
        fecha: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
      return false;
    }
  }
}