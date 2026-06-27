import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpclient: HttpClient) {}

  loginUser(username:string, password:string){
    return this.httpclient.post('https://ws.espam.edu.ec/api/auth/login',{
      username: username,
      password: password
    })
  }
  
}
