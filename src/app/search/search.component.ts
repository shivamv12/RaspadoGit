import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectedValue } from "../models/selected-value";
import { Userdata } from "../models/userdata";
import { NzNotificationService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  selectedValue: SelectedValue;
  userData: Userdata;
  output: any;
  repos: any;
  count: number;
  options: string[] = [];
  languages: Map<string, number> = new Map();

  validateForm: FormGroup;

  private searchSubject = new Subject<string>();

  constructor(
    private _dataService: UserDataService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usersearch: [null, [Validators.required]]
    });

    this.searchSubject.pipe(
      debounceTime(700),             // wait 700ms after typing stops
      distinctUntilChanged(),        // only new values
      switchMap(value => this._dataService.getUserByKey(value))
    ).subscribe(
      (res: any) => {
        this.output = res;
        this.count = this.output.total_count;
        this.options = this.output.items;
      },
      (error) => { console.log(error.message); }
    );
  }

  createNotification(type: string, url: string): void {
    this.notification.create(
      type,
      "You're going to be redirected.",
      "<a href='" + url + "' target='_blank'>Ok</a>",
      { nzDuration: 0 }
    );
  }

  submitForm(): void {
    if (!this.selectedValue) return;

    this._dataService.getUserDetails(this.selectedValue.login).subscribe(
      (userData: Userdata) => {
        this.userData = userData;
      },
      (error) => { console.log(error.message); }
    );

    this._dataService.getReposByUserId(this.selectedValue.login).subscribe(
      userRepos => {
        this.repos = userRepos;
        this.getLanguageCount();
      },
      (error) => { console.log(error.message); }
    );

    this.count = null;
  }

  getLanguageCount(): void {
    this.languages = new Map();
    this.repos.forEach(repo => {
      if (!repo.language) repo.language = 'Miscellaneous';
      let count: number = this.languages.get(repo.language);
      if (!count) {
        count = 1;
      } else {
        count = count + 1;
      }
      this.languages.set(repo.language, count);
    });
    this.calculatePercentage();
  }

  calculatePercentage(): void {
    const totalRepos: number = this.repos.length;
    for (let [lang, count] of this.languages.entries()) {
      let percentage = parseInt(((count / totalRepos) * 100).toFixed(2));
      this.languages.set(lang, percentage);
    }
  }

  onInput(value: string): void {
    if (value && value.trim().length > 0) {
      this.searchSubject.next(value.trim());
    }
  }
}
