import { Injectable } from '@angular/core';

@Injectable({
    providedIn : 'root'
})
export class Configuration {
    public serverUrl = 'https://api.github.com/';
    // public serverWithApiUrl = this.serverUrl + this.apiUrl;
}