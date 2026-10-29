import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

const X_AppMovil_Token = 'A9FZK2xJr8EwQG6V4sHJKKh5DcpT1YBvLnI3aRk7mUeWOH';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private storage: Storage;
  private storageReady:Promise<Storage>;


  constructor(private httpclient: HttpClient) {
    this.storage = new Storage();
    this.storageReady = this.storage.create();
  }

  // Consulta la API y guarda su respuesta localmente.
  // Si falla la conexión, recupera la última respuesta guardada.
  private getWithCache<T>(
    key: string,
    request: Observable<T>
  ): Observable<T> {

    return from(this.storageReady).pipe(

      switchMap(storage =>

        request.pipe(

          // Guardar la respuesta antes de entregarla al componente.
          switchMap(response =>
            from(storage.set(key, response)).pipe(
              map(() => response)
            )
          ),

          // Si falla la petición, intentar recuperar los datos locales.
          catchError(error => {

            // No ocultar errores de autenticación.
            if (error.status === 401 || error.status === 403) {
              return throwError(() => error);
            }

            return from(storage.get(key)).pipe(

              switchMap(cachedData => {

                if (
                  cachedData !== null &&
                  cachedData !== undefined
                ) {
                  return of(cachedData as T);
                }

                // No hay datos guardados: devolver el error original.
                return throwError(() => error);
              })

            );
          })

        )

      )

    );
  }


  // Api de implementacion para la logica de consumo necesario para el logeo de la app
  loginUser(email:string, password:string){
    return this.httpclient.post(`${API_URL}/auth/login`,{
      email: email,
      password: password
    })
  }

  loginMicrosoft(email:string){
    return this.httpclient.post(`${API_URL}/auth/microsoft`, {
      email: email
    })
  }

  cerrarSesion() {
    return this.httpclient.post(`${API_URL}/auth/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  getPerfilUsuario() {
    return this.httpclient.get(`${API_URL}/appmovil/perfil_usuario`, {
      headers: this.getHeaders()
    });
  }


    // ── Solo X-AppMovil-Token (endpoints públicos) ─────────
  private getPublicHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-AppMovil-Token': X_AppMovil_Token,
      'Content-Type': 'application/json',
    });
  }

  // Headers para los endpoints autenticados: el Authorization lo agrega automáticamente
  // el authInterceptor (lee el token desde Preferences), acá solo va el resto.
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }


  // getEventos() {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_eventos`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getEventos() {
    return this.getWithCache(
      'eventos',
      this.httpclient.get(
        `${API_URL}/appmovil/get_eventos`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }
  // getEventoById(id: string) {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_evento_id/${id}`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getEventoById(id: string) {
    return this.getWithCache(
      `evento_${id}`,
      this.httpclient.get(
        `${API_URL}/appmovil/get_evento_id/${id}`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }

  // getCategorias() {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_categorias`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getCategorias() {
    return this.getWithCache(
      'categorias',
      this.httpclient.get(
        `${API_URL}/appmovil/get_categorias`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }

  // getEventosByCategoria(id_categoria: string) {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_eventos_categoria/${id_categoria}`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getEventosByCategoria(id_categoria: string) {
    return this.getWithCache(
      `eventos_categoria_${id_categoria}`,
      this.httpclient.get(
        `${API_URL}/appmovil/get_eventos_categoria/${id_categoria}`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }

  // getEventosDestacados() {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_eventos_destacados`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getEventosDestacados() {
    return this.getWithCache(
      'eventos_destacados',
      this.httpclient.get(
        `${API_URL}/appmovil/get_eventos_destacados`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }


  // getPonentesByEvento(id_evento: string) {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_ponentes_por_evento/${id_evento}`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getPonentesByEvento(id_evento: string) {
    return this.getWithCache(
      `ponentes_evento_${id_evento}`,
      this.httpclient.get(
        `${API_URL}/appmovil/get_ponentes_por_evento/${id_evento}`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }

  // getDetallePonente(id_ponente: string) {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_detalle_ponente/${id_ponente}`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

  getDetallePonente(id_ponente: string) {
    return this.getWithCache(
      `detalle_ponente_${id_ponente}`,
      this.httpclient.get(
        `${API_URL}/appmovil/get_detalle_ponente/${id_ponente}`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }

  getMisEventos() {
    return this.httpclient.get(`${API_URL}/appmovil/get_mis_eventos`, {
        headers: this.getHeaders()

    });
  }

  getMisCertificados() {
    return this.httpclient.get(`${API_URL}/appmovil/get_certificados_usuario`, {
      headers: this.getHeaders()
    });
  }


  // getActividadesByEvento(id: string) {
  //   return this.httpclient.get(`${API_URL}/appmovil/get_actividades_evento/${id}`, {
  //     headers: this.getPublicHeaders()
  //   });
  // }

    getActividadesByEvento(id: string) {
    return this.getWithCache(
      `actividades_evento_${id}`,
      this.httpclient.get(
        `${API_URL}/appmovil/get_actividades_eventogit/${id}`,
        {
          headers: this.getPublicHeaders()
        }
      )
    );
  }


}
