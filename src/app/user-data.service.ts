import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Configuration } from './configuration';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private actionUrl: string;

  constructor(private http: HttpClient, private configuration: Configuration) {
    this.actionUrl = configuration.serverUrl;
  }

  public getUserByKey(key: string) {
    return this.http.get(this.actionUrl + 'search/users?q=' + key);
  }

  public getUserDetails(userId: string) {
    return this.http.get(this.actionUrl + 'users/' + userId);
  }

  public getReposByUserId(id: string) {
    return this.http.get(this.actionUrl + 'users/' + id + '/repos');
  }
}
