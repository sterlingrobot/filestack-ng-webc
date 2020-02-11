import { Component } from '@angular/core';
import { environment } from '../environments/environment';

import * as filestack from "filestack-js";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'filestack-ng-webc';
  alert: string = '';
  uploadedImgs: filestack.PickerFileMetadata[] = [];

  openFilePicker() {
    if(!environment.filestackApiKey) {
      return this.alert = `
        Set
        FILESTACK_API_KEY
        in .env prior to running npm start
      `;
    }
    const filestackClient = filestack.init(environment.filestackApiKey);
    return filestackClient.picker({
      onUploadDone: response => {
        const { filesUploaded } = response;
        if(filesUploaded.length) {
          this.uploadedImgs = [
            ...this.uploadedImgs,
            ...filesUploaded
              .map( file => /^image/.test(file.mimetype) && file)
              .filter(_ => !!_)
          ];
        }
      }
    }).open();
  }
}
