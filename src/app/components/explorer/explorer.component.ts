import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {v4 as uuidv4} from 'uuid';
import { KafkaMessage } from 'kafkajs';
import { actionShowToast, dataGeneratorDescriptionHTML, headerClusterList, headerExploreCluster } from 'src/app/definitions/constants';
import { NavigationAction } from 'src/app/models/navigation-action';
import { UserMessageTemplate } from 'src/app/models/user-templates';
import { GeneralParamsService } from 'src/app/services/general-params.service';
import { KafkaService } from 'src/app/services/kafka.service';
import { UserTemplatesService } from 'src/app/services/user-templates.service';
import { GeneralUtils } from 'src/app/utils/general-utils';
import { SwalHelpers } from 'src/app/utils/swal-helpers';
import * as monaco from "monaco-editor";
import { NgxEditorModel } from 'ngx-monaco-editor-v2';
import { DataGenerator } from 'src/app/utils/data-generator';
import { debounceTime, Subject } from 'rxjs';
import { SortType } from 'src/app/definitions/enums';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {
  //Kafka related
  public topics : string[] = [];
  public activeTopic: string = "";

  public isConsumerPaused: boolean = false;

  public isLoading : boolean = false;
  public loadingText: string = "";

  public receivedMessages: KafkaMessage[];

  public isShowingMessageDetails: boolean = false;
  public messageToShowDetails: KafkaMessage;

  //Templates related
  public templates: UserMessageTemplate[] = [];
  public isTemplateEditorOn = false;
  public isTemplateEditorSendRawMode = false;
  @Input() currentEditTemplate: UserMessageTemplate;

  private newMessageIconShownRecord: string[] = [];

  public sortingType: SortType = SortType.DateASC;

  //Search bars
  @Input() searchValue: string = "";
  private topicFilterValue: string = "";
  searchChange = new Subject<string>();

  @Input() searchTemplateValue: string = "";
  private templateFilterValue: string = "";
  searchTemplateChange = new Subject<string>();

  public isConnectionBroken = false;
  public connectionBrokenReason = "";

  //Monaco editor options - Template editor
  public templateEditorOptions = {
    value: "{}",
    language: 'json',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    fontSize: "14px",
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 2,
    minimap: {
      enabled: false,
    },
    theme: 'vs-dark'
  };
  @Input() templateEditorCode : string = "{}";

  //Monaco editor options - Message viewer
  public messageViewerOptions = {
    value: "{}",
    language: 'json',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: true,
    fontSize: "14px",
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 2,
    minimap: {
      enabled: false,
    },
    theme: 'vs-dark'
  };
  @Input() messageViewerCode : string = "{}";
    
  constructor(
    private kafkaService: KafkaService,
    private userTemplatesService: UserTemplatesService,
    private cdRef: ChangeDetectorRef,
    private generalParamsService: GeneralParamsService,
    private router: Router,
    private _ngZone: NgZone
  ) { 
    this.receivedMessages = [];
    this.currentEditTemplate = {} as UserMessageTemplate;
    this.searchChange.pipe(debounceTime(300)).subscribe(() => {
      this.updateSearch();
    });
    this.searchTemplateChange.pipe(debounceTime(300)).subscribe(() => {
      this.updateSearch();
    });
  }

  ngOnInit(): void {
    dayjs.extend(utc);
    this.generalParamsService.setHeaderMode(headerExploreCluster);
    this.generalParamsService.setClusterName(this.kafkaService.currentClusterInfo().name);
    this.generalParamsService.setIsSecureMode(this.kafkaService.currentClusterInfo().secureMode);
    this.generalParamsService.setIsReadOnly(this.kafkaService.currentClusterInfo().readOnly);

    this.kafkaService.errorCallback = (error: any) => {
      console.error("### Connection crashed. Running error callback ###");
      this.isConnectionBroken = true;
      this.generalParamsService.setHeaderMode(headerClusterList);
      this.generalParamsService.setSubscribedTopic("");
      this.generalParamsService.setIsSecureMode(false);
      this.generalParamsService.setIsReadOnly(false);
      if (error != undefined && error.payload != undefined){
        this.connectionBrokenReason = JSON.stringify(error.payload);
      } else {
        this.connectionBrokenReason = "Unknown error";
      }
      console.log(error);
      this.cdRef.detectChanges();
    };

  }

  ngAfterViewInit() {
    this.setLoading("Loading cluster data");

    console.log("Checking cluster connection");
    if (!this.kafkaService.isConnected()){
      this.isLoading = false;
      console.warn("Tried to open clusteer without a custer connected");
      let action : NavigationAction = {
        action: actionShowToast,
        type: 'error',
        value: 'Cluster connection problem'
      } 
      this.router.navigate(['/'], { queryParams : { navAction :  JSON.stringify(action) }} );
    }

    this.loadUserTemplates();
    this.loadTopicsList(); //NOTE: This is async, so user templates first.
  }

  loadTopicsList(){
    this.setLoading("Loading topics list");
    this.cdRef.detectChanges();
    console.log("Fetching topic list");
    //TODO: This will fail if admin is not available
    this.kafkaService.topicsList().then((value)=>{
      this.topics = value;
      this.isLoading = false;
      this.cdRef.detectChanges();
    }).catch((e)=>{
      console.log("Unable to retrieve topics");
      console.log(e);
    });
  }

  loadUserTemplates(): void {
    this.setLoading("Loading user templates");
    this.templates = this.userTemplatesService.getUserTemplates();
    console.log(this.templates);
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  openCreateTemplate(): void { 
    this.currentEditTemplate = {} as UserMessageTemplate;
    this.templateEditorCode = "{}";
    this.isTemplateEditorOn = true;
    this.isTemplateEditorSendRawMode = false;
  } 

  openSendRaw(): void { 
    this.currentEditTemplate = {} as UserMessageTemplate;
    this.templateEditorCode = "{}";
    this.isTemplateEditorOn = true;
    this.isTemplateEditorSendRawMode = true;
  }

  showTemplateDetails(template: UserMessageTemplate): void {
    this.currentEditTemplate = template;
    this.templateEditorCode = this.currentEditTemplate.value;
    this.isTemplateEditorOn = true;
    this.isTemplateEditorSendRawMode = false;
  }

  saveTemplateChanges(): void {
    if (!this.isEditorValidJSON){
      SwalHelpers.triggerToast("error", "JSON is not valid");
      return;
    }

    this.currentEditTemplate.value = this.templateEditorCode;
    if (this.currentEditTemplate.name == "" || !this.currentEditTemplate.name){
      this.currentEditTemplate.name = GeneralUtils.getFunnyNameFor("template");
    }
    if (this.currentEditTemplate.id == "" || !this.currentEditTemplate.id){
      this.currentEditTemplate.id = uuidv4();
      this.userTemplatesService.addUserTemplate(this.currentEditTemplate);
      
    } else {
      this.userTemplatesService.updateUserTemplate(this.currentEditTemplate);
    } 
    this.isTemplateEditorOn = false;
    this.loadUserTemplates();
    SwalHelpers.triggerToast("success", "Template saved");    
  }

  async saveTemplateAndSend(): Promise<void> {
    if (!this.isEditorValidJSON){
      SwalHelpers.triggerToast("error", "JSON is not valid");
      return;
    }

    if(this.kafkaService.currentClusterInfo().readOnly){
      SwalHelpers.triggerToast("error", "Read-only connection mode");
      return;
    }

    this.currentEditTemplate.value = this.templateEditorCode;
    if (this.currentEditTemplate.name == "" || !this.currentEditTemplate.name){
      this.currentEditTemplate.name = GeneralUtils.getFunnyNameFor("template");
    }
    if (this.currentEditTemplate.id == "" || !this.currentEditTemplate.id){
      this.currentEditTemplate.id = uuidv4();
      this.userTemplatesService.addUserTemplate(this.currentEditTemplate);
      
    } else {
      this.userTemplatesService.updateUserTemplate(this.currentEditTemplate);
    } 
    this.isTemplateEditorOn = false;
    this.loadUserTemplates();
    if (this.isTopicActive()){
      this.setLoading("Publishing message to topic "+this.activeTopic);
      let processedValue = DataGenerator.processString(this.currentEditTemplate.value);
      let result = await this.kafkaService.produceToTopic(this.activeTopic, this.currentEditTemplate.key, processedValue);
      if (result){
        SwalHelpers.triggerToast("success", "Template saved and sent");  
      } else {
        SwalHelpers.triggerToast("error", "Template saved but not sent");
      }
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  async sendRawMessage(): Promise<void> {
    if (!this.isEditorValidJSON){
      SwalHelpers.triggerToast("error", "JSON is not valid");
      return;
    }

    if(this.kafkaService.currentClusterInfo().readOnly){
      SwalHelpers.triggerToast("error", "Read-only connection mode");
      return;
    }

    this.currentEditTemplate.value = this.templateEditorCode;
    this.isTemplateEditorOn = false;
    if (this.isTopicActive()){
      this.setLoading("Publishing message to topic "+this.activeTopic);
      let processedValue = DataGenerator.processString(this.currentEditTemplate.value);
      let result = await this.kafkaService.produceToTopic(this.activeTopic, this.currentEditTemplate.key, processedValue);
      if (result){
        SwalHelpers.triggerToast("success", "Template saved and sent");  
      } else {
        SwalHelpers.triggerToast("error", "Template saved but not sent");
      }
      this.isLoading = false;
      this.cdRef.detectChanges();
    } else {
      SwalHelpers.triggerToast("error", "No active topic to publish");
      console.error("Trying to publish message without active topic");
    }
  }

  async sendSingleTemplate(template: UserMessageTemplate): Promise<void> {
    if(this.kafkaService.currentClusterInfo().readOnly){
      SwalHelpers.triggerToast("error", "Read-only connection mode");
      return;
    }
    
    if (this.isTopicActive()){
      this.setLoading("Publishing message to topic "+this.activeTopic);
      let processedValue = DataGenerator.processString(template.value);
      let result = await this.kafkaService.produceToTopic(this.activeTopic, template.key, processedValue);
      if (result){
        SwalHelpers.triggerToast("success", "Message published");  
      } else {
        SwalHelpers.triggerToast("error", "Unable to publish message");
      }
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  exportSingleTemplate(template: UserMessageTemplate){
    console.log("Exporting template "+template.name);
    let name = "e_template_"+template.name+".json";
    let ouput = JSON.stringify(template);
    window.files.save(ouput, name).then((result) => {
      if (result){
        SwalHelpers.triggerToast("success", "Template exported");
      } else {
        SwalHelpers.triggerToast("error", "Unable to export template");
      }
    }), () => {
      SwalHelpers.triggerToast("error", "Unable to export template");
    };
  }

  importTemplate(): void {
    console.log("Importing templates");
    window.files.read().then((fileData) => {
      if (fileData){
        this.processImportData(fileData);
      } else {
        SwalHelpers.triggerToast("error", "Unable import data");
      }
    }), () => {
      SwalHelpers.triggerToast("error", "Unable import data");
    };
  }

  private processImportData(data: string){
    if (data == ""){
      SwalHelpers.triggerToast("error", "Empty import data");
      return;
    }

    let parsedData;

    try {
      parsedData = JSON.parse(data);
    } catch (e){
      SwalHelpers.triggerToast("error", "Unable to parse data");
      return;
    }

    if (Array.isArray(parsedData)){
      //Collection
      let templatesToImport = parsedData as UserMessageTemplate[];
      for(let i=0; i<templatesToImport.length; i++){
        this.userTemplatesService.addUserTemplate(templatesToImport[i]);
      }
      SwalHelpers.triggerToast("success", "Collection exported");
    } else {
      let templateToImport = parsedData as UserMessageTemplate;
      this.userTemplatesService.addUserTemplate(templateToImport);
      SwalHelpers.triggerToast("success", "Template imported");
    }

    this.loadUserTemplates();
  }

  exportCollection(): void {
    console.log("Exporting user messages collection");
    let name = "e_templates_collection.json";
    let ouput = JSON.stringify(this.templates);
    window.files.save(ouput, name).then((result) => {
      if (result){
        SwalHelpers.triggerToast("success", "Collection exported");
      } else {
        SwalHelpers.triggerToast("error", "Unable to export collection");
      }
    }), () => {
      SwalHelpers.triggerToast("error", "Unable to export collection");
    };
  }

  closeTemplateEditorOrRawSend(): void {
    //TODO: Detect unsaved changes and request confirmation
    this.isTemplateEditorOn = false;
  }

  deleteTemplate(template: UserMessageTemplate): void {
    SwalHelpers.showConfirmationWarning("Delete template", "Are you sure you want to delete template: "+template.name+"?", "Delete", ()=>{
      this.userTemplatesService.removeUserTemplate(template.id);
      SwalHelpers.triggerToast("success", "Template deleted");
      this.loadUserTemplates();
    });
  }

  setActiveTopic(topic: string): void {
    if (topic != this.activeTopic){
      console.log("Subscribing to topic "+topic);
      this.activeTopic = topic;
      this.generalParamsService.setSubscribedTopic(this.activeTopic);
      this.setLoading("Subscribing to "+this.activeTopic);

      this.kafkaService.subscribeTo(this.activeTopic, (topic: string, message: KafkaMessage) =>{
        if (message != undefined){
          console.log("Message received from subscribed topic");
          console.log(message);
          this.receivedMessages.unshift(message);
        }
        this.cdRef.detectChanges();
      }).then(() =>{
        console.log("Topic consumption started");
        SwalHelpers.triggerToast('info', "Subscribed to topic");
        this.isLoading = false; //NOTE: Next calls detect changes
        this.isConsumerPaused = false;
        this.cleanupMessages();
      }).catch((e) => {
        console.log("Problem with consumption");
        console.log(e);

        this.kafkaService.cleanUpConnection(() => {
          let action : NavigationAction = {
            action: actionShowToast,
            type: 'error',
            value: 'Consumption failure'
          } 
          this.router.navigate(['/'], { queryParams : { navAction :  JSON.stringify(action) }} );
        });
      });
    }
  }

  resumeConsumer(): void {
    console.log("Resuming consumer");
    this.kafkaService.resumeConsumer();
    this.isConsumerPaused = false;
    this.cdRef.detectChanges();
    SwalHelpers.triggerToast("success", "Consumer resumed");
  }

  pauseConsumer(): void {
    console.log("Pausing consumer");
    this.kafkaService.pauseConsumer();
    this.isConsumerPaused = true;
    this.cdRef.detectChanges();
    SwalHelpers.triggerToast("warning", "Consumer paused");
  }

  createTopic(): void {
    console.log("User requested topic creation");
    SwalHelpers.showTextInputSwal("Create topic", "Topic name", "Name is required", async (value: string) => {
      if (!value){
        return;
      }

      if (this.topics.includes(value)){
        SwalHelpers.triggerToast("error", "Topic name already taken");
      }

      this.setLoading("Creating new topic: "+value);
      this.cdRef.detectChanges();

      let result = await this.kafkaService.createTopic(value);
      if (result){
        SwalHelpers.triggerToast("success", "Topic created");
        this.loadTopicsList();
      } else {
        SwalHelpers.triggerToast("error", "Unable to create topic");
      }
    });
  }

  showMessageDetails(message: KafkaMessage): void{
    this.isShowingMessageDetails = true;
    this.messageToShowDetails = message;
    this.messageViewerCode = this.getMessageStringValue(this.messageToShowDetails);
    this.cdRef.detectChanges();
  }

  backToMessageList(): void {
    this.isShowingMessageDetails = false;
    this.cdRef.detectChanges();
  }

  copyMessageBodyToClipboard(): void {
    if (this.isShowingMessageDetails){
      navigator.clipboard.writeText(this.kafkaService.getMessageStringValue(this.messageToShowDetails)).then(() => {
        SwalHelpers.triggerToast("info", "Copied to clipboard");
      }, () => {
        SwalHelpers.triggerToast("error", "Unable to copy to clipboard");
      });
    }
  }

  getMessageStringValue(message: KafkaMessage){
    let msg = this.kafkaService.getMessageStringValue(message);
    if (msg != "" && msg != undefined){
      return msg;
    }
    return "(empty)";
  }

  getMessageStringKey(message: KafkaMessage){
    let key = this.kafkaService.getMessageStringKey(message);
    if (key != "" && key != undefined){
      return key;
    }
    return "(empty)";
  }

  getDateFormatted(stringDate: string){
    return dayjs(Number(stringDate)).utc().format();
  }

  setLoading(message: string){
    this.loadingText = message;
    this.isLoading = true;
  }

  cleanupMessagesUserAction(): void {
    this.cleanupMessages();
    SwalHelpers.triggerToast('info', "Message history cleaned");
  }

  cleanupMessages(): void {
    console.log("Cleaning up message list");
    this.receivedMessages = [];
    this.newMessageIconShownRecord = [];
    this.cdRef.detectChanges();
  }

  isTopicActive(): boolean {
    return this.activeTopic != "";
  }

  shouldShowNewMessageIcon(timestamp: string){
    if (!this.newMessageIconShownRecord.includes(timestamp)){
      this.newMessageIconShownRecord.push(timestamp);
      return true;
    } else if (this.elapsedSecondsSinceTimestamp(timestamp) <= 3){
      return true;
    }
    return false;
  }

  elapsedSecondsSinceTimestamp(timestamp: string) : number{
    return (Date.now() - Number(timestamp)) / 1000 
  }

  beautifyCode(): void {
    if (this.isEditorValidJSON()){
      let object = JSON.parse(this.templateEditorCode);
      let beautified = JSON.stringify(object, null, 2);
      this.templateEditorCode = beautified;
      this.cdRef.detectChanges();
      SwalHelpers.triggerToast("success", "JSON beautified");
    } else {
      SwalHelpers.triggerToast("error", "Must be a valid JSON");
    }
  }

  compactCode(): void {
    if (this.isEditorValidJSON()){
      let object = JSON.parse(this.templateEditorCode);
      let compacted = JSON.stringify(object);
      this.templateEditorCode = compacted;
      this.cdRef.detectChanges();
      SwalHelpers.triggerToast("success", "JSON compacted");
    } else {
      SwalHelpers.triggerToast("error", "Must be a valid JSON");
    }
  }

  generatorsTips(): void {
    SwalHelpers.showHTMLTextSwal(dataGeneratorDescriptionHTML);
  }

  isEditorValidJSON(): boolean {
    try {
      JSON.parse(this.templateEditorCode);
    } catch (e) {
      try {
        JSON.parse(DataGenerator.processString(this.templateEditorCode));
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  searchChanged(event: any): void {
    this.searchChange.next(this.searchValue);
  }

  searchTemplateChanged(event: any): void {
    this.searchTemplateChange.next(this.searchTemplateValue);
  }

  getFilteredTopics(): string[] {
    if (this.searchValue != ''){
      return this.topics.filter(t => t.toLowerCase().includes(this.searchValue.toLowerCase()));
    }
    return this.topics;
  }

  getFilteredTemplates(): UserMessageTemplate[] {
    if (this.searchTemplateValue != ''){
      return this.templates.filter(t => t.name.toLowerCase().includes(this.searchTemplateValue.toLowerCase()));
    }
    return this.templates;
  }

  updateSearch(): void {
    this.topicFilterValue = this.searchValue;
  }

  updateTemplateSearch(): void {
    this.templateFilterValue = this.searchTemplateValue;
  }

  removeSearch(): void {
    this.searchValue = '';
    this.updateSearch();
  }

  duplicateTemplate(template: UserMessageTemplate) : void {
    let jsonString = JSON.stringify(template);
    let cloned = JSON.parse(jsonString) as UserMessageTemplate;

    cloned.id = uuidv4();
    cloned.name = cloned.name + " copy";
    this.userTemplatesService.addUserTemplate(cloned);
    
    this.loadUserTemplates();
    SwalHelpers.triggerToast("success", "Template duplicated");   
  }

  getSortedTemplates(): UserMessageTemplate[] {
    switch (this.sortingType) {
      case SortType.NameAZ:
        return this.getFilteredTemplates().sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
      case SortType.NameZA:
        return this.getFilteredTemplates().sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1);
      case SortType.DateASC:
        return this.getFilteredTemplates().sort((a, b) => a.dateAdded > b.dateAdded ? 1 : -1);
      case SortType.DateDESC:
        return this.getFilteredTemplates().sort((a, b) => a.dateAdded < b.dateAdded ? 1 : -1);
    }
  }

  changeSorting(): void {
    if (this.getCurrentSortingValue() == 1) {
      this.sortingType = SortType.DateDESC;
    } else if (this.getCurrentSortingValue() == 2) {
      this.sortingType = SortType.NameAZ;
    } else if (this.getCurrentSortingValue() == 3) {
      this.sortingType = SortType.NameZA;
    } else if (this.getCurrentSortingValue() == 4) {
      this.sortingType = SortType.DateASC;
    }
  }

  getCurrentSortingValue() : number {
    return this.sortingType;
  }

  navigateToClusterList() : void {
    console.info("Going back to list after connection broken");
    if (!NgZone.isInAngularZone()){
      this._ngZone.run(() =>{
        let action : NavigationAction = {
          action: actionShowToast,
          type: 'error',
          value: 'Session ended'
        } 
    
        this.router.navigate(['/'], { queryParams : { navAction :  JSON.stringify(action) }} );
      });
    }
  }
}
