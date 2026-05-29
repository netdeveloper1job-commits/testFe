import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ENDPOINTS } from '../../../core/endpoints';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { columnsModel } from '../../../core/models/columnsModel';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { User } from '../../../core/models/users';
import { ApiResponse } from '../../../core/models/api-response';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule,BootstrapTableComponent],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  bodyTemplate:any
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedUser: User | null = null;
  allUsers = signal<User[]>([]);
  form!: FormGroup;

   public columns: Array<columnsModel> = [
      {
        caption: 'S. N',
        dataField: 'sNumber',
        isTemplate: false,
      },
      {
        caption: 'Name',
        dataField: 'name',
        isTemplate: false,
        isTooltip: false,
      },
      {
        caption: 'Designation',
        dataField: 'designation',
        isTemplate: false,
        isTooltip: false,
      },
      {
        caption: 'Email',
        dataField: 'emailId',
        isTemplate: false,
        isTooltip: false,
      },

       {
        caption: 'Phone Number',
        dataField: 'phoneNumber',
        isTemplate: false,
        isTooltip: false,
      },
      {
        caption: 'Password',
        dataField: 'password',
        isTemplate: false,
        isTooltip: false,
      },
       {
        caption: 'Action',
        dataField: 'Action',
        isTemplate: true,
        isTooltip: false,
      },
    ];
    
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getAllUsers();
  }

  createForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      designation: ['', Validators.required],
      phoneNumber:['', Validators.required]
    });
  }

  addUser(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      name: formValue.name,
      emailId: formValue.emailId,
      password: formValue.password,
      designation: formValue.designation,
      phoneNumber:formValue.phoneNumber
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<User>>(ENDPOINTS.USERS.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllUsers();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to save user.');
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
      return;
    }

    if (!this.selectedUser?.id) {
      this.isSubmitting = false;
      return;
    }

    if (!payload['password']) {
      delete payload['password'];
    }

    this.apiService.put<ApiResponse<User>>(ENDPOINTS.USERS.UPDATE(this.selectedUser.id), payload).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Updated successfully.');
        this.getAllUsers();
        this.cancel();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to update user.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  getAllUsers(): void {
    this.apiService.get<ApiResponse<User[]>>(ENDPOINTS.USERS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allUsers.set(
          list.map((user, index) => ({
            ...user,
            sNumber: index + 1,
          })),
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to fetch users.');
      },
    });
  }

  edit(item: User): void {
    this.selectedUser = item;
    this.showUpdateButton = true;

    this.form.patchValue({
      name: item.name,
      emailId: item.emailId,
      password: item.password,
      designation: item.designation,
      phoneNumber: item.phoneNumber
    });

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedUser = null;
    this.form.reset();
    this.form.get('password')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.USERS.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllUsers();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to delete user.');
      },
    });
  }

}
