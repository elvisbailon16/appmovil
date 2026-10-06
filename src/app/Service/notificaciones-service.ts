import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  // Servicio singleton (providedIn: 'root'): el constructor corre una sola vez,
  // así que los listeners de PushNotifications se registran una única vez.
  constructor(private platform:Platform) {
    if(this.platform.is('capacitor')) {
      this.InitPush();
    }
  }

  InitPush() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android 13+ pedirá el permiso POST_NOTIFICATIONS (declarado en AndroidManifest.xml);
    // en versiones anteriores de Android se concede automáticamente.
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        console.warn('Permiso de notificaciones push denegado.');
      }
    });

    // Notificaciones locales: se usan para poder MOSTRAR el push cuando llega con
    // la app en primer plano (FCM no dibuja nada automáticamente en ese caso, solo
    // entrega el payload al listener 'pushNotificationReceived' de más abajo).
    LocalNotifications.requestPermissions().catch(err =>
      console.error('Error pidiendo permiso de notificaciones locales:', err)
    );

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        // alert('Push registration success, token: ' + token.value);
        // Clave propia (no 'token'): esa la usa Auth para el access_token de sesión.
        Preferences.set({ key: 'push_token', value: token.value });
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        // alert('Error on registration: ' + JSON.stringify(error));
        console.error('Error on registration: ', error);
      }
    );

    // Con la app en primer plano, FCM no muestra nada por su cuenta: hay que
    // dibujar la notificación nosotros mismos con LocalNotifications.
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ', notification);

        LocalNotifications.schedule({
          notifications: [{
            id: Date.now() % 2147483647,
            title: notification.title ?? 'TerriMeet',
            body: notification.body ?? '',
            extra: notification.data,
          }],
        }).catch(err => console.error('Error mostrando notificación local:', err));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
        console.log('Push action performed: ', notification);
      }
    );
  }

}
