import { Injectable } from '@angular/core';
import { storageUserTemplatesKey } from '../definitions/constants';
import { UserMessageTemplate } from '../models/user-templates';
import { StorageService } from './storage.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

@Injectable({
  providedIn: 'root'
})
export class UserTemplatesService {

  constructor(private storageService: StorageService,) { 
    dayjs.extend(utc);    
  }

  getUserTemplates(): Array<UserMessageTemplate> {
    let userTemplates = this.storageService.get(storageUserTemplatesKey);
    if (userTemplates == undefined){
      console.warn("Unable to retrieve user templates. Creating empty record");
      userTemplates = new Array<UserMessageTemplate>();
      this.storageService.set(storageUserTemplatesKey, userTemplates);
    }
    return userTemplates;
  }

  addUserTemplate(template: UserMessageTemplate): void {
    
    template.dateAdded = dayjs().utc().format();
    template.dateModified = dayjs().utc().format();

    //NOTE: Data is always fetched to account for external changes
    let userTemplates = this.getUserTemplates();
    userTemplates.push(template);
    this.storageService.set(storageUserTemplatesKey, userTemplates);
  }

  updateUserTemplate(template: UserMessageTemplate): void {
    template.dateModified = dayjs().utc().format();

    let userTemplates = this.getUserTemplates();
    let currentTemplateIndex = userTemplates.findIndex(x => x.id == template.id);
    //NOTE: Replaces old with updated one
    userTemplates.splice(currentTemplateIndex, 1, template);
    this.storageService.set(storageUserTemplatesKey, userTemplates);
  }

  removeUserTemplate(templateId: string): void {
    let userTemplates = this.getUserTemplates();
    userTemplates = userTemplates.filter(x => x.id !== templateId); 
    this.storageService.set(storageUserTemplatesKey, userTemplates);
  }
}
