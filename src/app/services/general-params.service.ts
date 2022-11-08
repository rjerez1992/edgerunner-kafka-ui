import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { headerClusterList } from '../definitions/constants';

@Injectable({
  providedIn: 'root'
})
export class GeneralParamsService {
  private headerMode$: BehaviorSubject<string> = new BehaviorSubject(headerClusterList);
  private clusterName$: BehaviorSubject<string> = new BehaviorSubject("Unnamed");

  private isSecureMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isReadOnly$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private subscribedTopic$: BehaviorSubject<string> = new BehaviorSubject("");

  constructor() { }

  getHeaderMode(): Observable<string> {
    return this.headerMode$;
  }

  setHeaderMode(d: string): void {
    this.headerMode$.next(d);
  }

  getClusterName(): Observable<string> {
    return this.clusterName$;
  }

  setClusterName(d: string): void {
    this.clusterName$.next(d);
  }

  getIsSecureMode(): Observable<boolean> {
    return this.isSecureMode$;
  }

  setIsSecureMode(d: boolean): void {
    this.isSecureMode$.next(d);
  }

  getIsReadOnly(): Observable<boolean> {
    return this.isReadOnly$;
  }

  setIsReadOnly(d: boolean): void {
    this.isReadOnly$.next(d);
  }

  getSubscribedTopic(): Observable<string> {
    return this.subscribedTopic$;
  }

  setSubscribedTopic(d: string): void {
    this.subscribedTopic$.next(d);
  }
}
