import { ViewEncapsulation, Component, OnInit } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectedValue } from "../models/selected-value";
import { Userdata } from "../models/userdata";
import { NzNotificationService } from 'ng-zorro-antd';

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

  constructor(private _dataService: UserDataService, private fb: FormBuilder, private notification: NzNotificationService) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usersearch: [null, [Validators.required]]
    });
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
    this._dataService.getUserDetails(this.selectedValue.login).subscribe(
      (userData: Userdata) => {
        this.userData = userData;
      },
      (error) => { console.log(error.message); });

    this._dataService.getReposByUserId(this.selectedValue.login).subscribe(
      userRepos => {
        this.repos = userRepos;
        this.getLanguageCount();
      },
      (error) => { console.log(error.message); });

    this.count = null;
  }

  getLanguageCount(): void {
    this.languages = new Map();
    this.repos.forEach(repo => {
      if (!repo.language) repo.language = 'Miscellaneous';
      let count: number = this.languages.get(repo.language);
      if (!count) {
        count = 1;
        this.languages.set(repo.language, count);
      } else {
        count = count + 1;
        this.languages.set(repo.language, count);
      }
    });
    this.calculatePercentage();
  }

  calculatePercentage(): void {
    console.log(this.languages);

    const totalRepos: number = this.repos.length;

    let entries = this.languages.entries();

    for(let entry of entries) {
      let percentage = parseInt(((entry[1] / totalRepos) * 100).toFixed(2));
      this.languages.set(entry[0], percentage);
    }

    console.log(this.languages);
  }

  onInput(value: string): void {
    this._dataService.getUserByKey(value).subscribe(res => {
      this.output = res;
      this.count = this.output.total_count;
      this.options = this.output.items;
    },
      (error) => { console.log(error.message); });
  }
}
