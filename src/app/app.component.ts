import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AppState } from './interface/app.state';
import { ServerService } from './service/server.service';
import { CustomResponse } from './interface/custom-responce';
import { DateState } from './enum/data-state.enum';
import { Status } from './enum/status.enum'
import { catchError, map, startWith } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { Server } from './interface/server';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  appState$ : Observable<AppState<CustomResponse>>;
  readonly DateState = DateState;
  //readonly Status = Status;

  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();

  private isLoaading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoaading.asObservable();

  title = 'ServerListAppFrontPartAngular';
  Status: any;

  constructor(private serverService: ServerService) {}

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
    .pipe(
      map(response => {
        this.dataSubject.next(response);
        return {dataState: DateState.LOADED_STATE, appData: {...response, data: { servers: response.data.servers.reverse()}}}
      }),
      startWith({ dataState: DateState.LOADING_STATE }),
      catchError((error: string) => {
        return of({ dateState: DateState.ERROR_STATE, error})
      })
    );
  }


  pingServer(ipAdress: string): void {
    this.filterSubject.next(ipAdress);
    this.appState$ = this.serverService.ping$(ipAdress)
    .pipe(
      map(response => {
        const index = this.dataSubject.value.data.servers.findIndex(server =>
            server.id === response.data.server.id
        );
        this.dataSubject.value.data.servers[index] = response.data.server;
        this.filterSubject.next('');
        return {dataState: DateState.LOADED_STATE, appData: response}
      }),
      startWith({ dataState: DateState.LOADED_STATE, appData: this.dataSubject.value}),
      catchError((error: string) => {
        this.filterSubject.next('');
        return of({ dateState: DateState.ERROR_STATE, error})
      })
    );
  }


  saveServer(serverForm: NgForm): void {
    this.isLoaading.next(true);
    this.appState$ = this.serverService.save$(serverForm.value as Server)
    .pipe(
      map(response => {
        this.dataSubject.next(
          {...response, data: {servers: [response.data.server, ...this.dataSubject.value.data.servers] }}
        );
        document.getElementById('closeModal').click();
        this.isLoaading.next(false);
        serverForm.resetForm({ status: this.Status.SERVER_DOWN})
        return {dataState: DateState.LOADED_STATE, appData: this.dataSubject.value}
      }),
      startWith({ dataState: DateState.LOADED_STATE, appData: this.dataSubject.value}),
      catchError((error: string) => {
        this.isLoaading.next(false);
        return of({ dateState: DateState.ERROR_STATE, error})
      })
    );
  }


  filterServers(status: Status): void {
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
    .pipe(
      map(response => {
        return {dataState: DateState.LOADED_STATE, appData: response}
      }),
      startWith({ dataState: DateState.LOADED_STATE, appData: this.dataSubject.value}),
      catchError((error: string) => {
        return of({ dateState: DateState.ERROR_STATE, error})
      })
    );
  }


  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id)
    .pipe(
      map(response => {
        this.dataSubject.next(
          {...response, data:
            {servers: this.dataSubject.value.data.servers.filter(s => s.id !==server.id) }}
        );
        return {dataState: DateState.LOADED_STATE, appData: response}
      }),
      startWith({ dataState: DateState.LOADED_STATE, appData: this.dataSubject.value}),
      catchError((error: string) => {
        return of({ dateState: DateState.ERROR_STATE, error})
      })
    );
  }


  printExcelReport(): void {
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');
    let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ',' + tableHTML;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink)
  }

  printReport(): void {
    window.print();
  }


}




