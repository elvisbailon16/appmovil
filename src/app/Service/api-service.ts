import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


const X_AppMovil_Token = 'A9FZK2xJr8EwQG6V4sHJKKh5DcpT1YBvLnI3aRk7mUeWOH';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private httpclient: HttpClient) {}
  // Api de implementacion para la logica de consumo necesario para el logeo de la app
  loginUser(email:string, password:string){
    return this.httpclient.post('https://ws.espam.edu.ec/api/auth/login',{
      email: email,
      password: password
    })
  }


  // refreshAuthToken() {
  //   const refreshToken = localStorage.getItem('refreshToken');
  //   if (!refreshToken) {
  //     return Promise.reject('No refresh token available');
  //   }

  //   return this.httpclient.post('https://ws.espam.edu.ec/api/auth/refresh', {
  //     refresh_token: refreshToken
  //   });
  // }

    // ── Solo X-AppMovil-Token (endpoints públicos) ─────────
  private getPublicHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-AppMovil-Token': X_AppMovil_Token,
      'Content-Type': 'application/json',
    });
  }

  // Headers para la autenticacion de la app movil con los dos tokens
    private getHeaders(): HttpHeaders {
    const jwt = localStorage.getItem('token') ?? '';
 
    return new HttpHeaders({
      'X-AppMovil-Token': X_AppMovil_Token,
      'Authorization':    `Bearer ${jwt}`,
      'Content-Type':     'application/json',
    });
  }
  getEventos() {
    return this.httpclient.get('https://ws.espam.edu.ec/api/appmovil/get_eventos', {
      headers: this.getPublicHeaders()
    });
  }
  
  getEventoById(id: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_evento_id/${id}`, {
      headers: this.getPublicHeaders()
    });
  }


  getCategorias() {
    return this.httpclient.get('https://ws.espam.edu.ec/api/appmovil/get_categorias', {
      headers: this.getPublicHeaders()
    });
  }

  getEventosByCategoria(id_categoria: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_eventos_categoria/${id_categoria}`, {
      headers: this.getPublicHeaders()
    });
  }

  getPonentesByEvento(id_evento: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_ponentes_por_evento/${id_evento}`, {
      headers: this.getPublicHeaders()
    });
  }

  getDetallePonente(id_ponente: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_detalle_ponente/${id_ponente}`, {
      headers: this.getPublicHeaders()
    });
  }

}