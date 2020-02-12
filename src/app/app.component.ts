import { Component } from '@angular/core';
import { environment } from '../environments/environment';

import * as filestack from 'filestack-js';

/**
 * MS Edge gets stuck in a loop when opening the local file picker,
 *  due to the __shady_dispatchEvent that re-triggers the file input
 *  button within the Filestack widget.  In this case, we attach
 *  a handler onto that shady event and stopPropagation on it.
 */
const isEdgePolyfill: () => boolean = () =>
  /Edge\/\d{2}/.test(window.navigator.userAgent) && 'ShadyDOM' in window;

const attachEdgeHijack = (tries: number) => {
  const input = document.getElementById('fsp-fileUpload');
  const hasShadyEvents = input && '__shady_addEventListener' in input;
  if (input && hasShadyEvents) {
    return (input as any).__shady_addEventListener('click', e =>
      e.stopPropagation()
    );
  }
  // If the widget has not loaded yet, we set a timeout for recheck
  return tries > 0 && setTimeout(attachEdgeHijack.bind(null, --tries), 200);
};

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
    if (!environment.filestackApiKey) {
      return (this.alert = `
        Set
        FILESTACK_API_KEY
        in .env prior to running npm start
      `);
    }
    const filestackClient = filestack.init(environment.filestackApiKey);
    return filestackClient
      .picker({
        onOpen: isEdgePolyfill() ? attachEdgeHijack.bind(null, 10) : () => {},

        onUploadDone: response => {
          const { filesUploaded } = response;
          if (filesUploaded.length) {
            this.uploadedImgs = [
              ...this.uploadedImgs,
              ...filesUploaded
                .map(file => /^image/.test(file.mimetype) && file)
                .filter(_ => !!_)
            ];
          }
        }
      })
      .open();
  }
}
