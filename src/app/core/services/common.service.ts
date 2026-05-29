import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private spinnerSubject = new BehaviorSubject<boolean>(false);
  spinnerState$ = this.spinnerSubject.asObservable();
  constructor(public toastr:ToastrService) { }

  showtoaster(type: any, message: any): void {
    if (type == 'Success') {
      this.toastr.success(type, message);
    } else if (type == 'Error') {
      this.toastr.error(type, message);
    } else if (type == 'Delete') {
      this.toastr.error(type, message);
    }else if (type == 'Info') {
       this.toastr.info(message, type);
    }
     else {
      this.toastr.show(type, message);
    }
  }

  show() {
    this.spinnerSubject.next(true);
  }

  hide() {
    this.spinnerSubject.next(false);
  }
}
