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
  loginUser(username:string, password:string){
    return this.httpclient.post('https://ws.espam.edu.ec/api/auth/login',{
      username: username,
      password: password
    })
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
      headers: this.getHeaders()
    });
  }
  
  getEventoById(id: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_evento_id/${id}`, {
      headers: this.getHeaders()
    });
  }


  getCategorias() {
    return this.httpclient.get('https://ws.espam.edu.ec/api/appmovil/get_categorias', {
      headers: this.getHeaders()
    });
  }

  getEventosByCategoria(id_categoria: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_eventos_categoria/${id_categoria}`, {
      headers: this.getHeaders()
    });
  }

  getPonentesByEvento(id_evento: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_ponentes_por_evento/${id_evento}`, {
      headers: this.getHeaders()
    });
  }

  getDetallePonente(id_ponente: string) {
    return this.httpclient.get(`https://ws.espam.edu.ec/api/appmovil/get_detalle_ponente/${id_ponente}`, {
      headers: this.getHeaders()
    });
  }
}