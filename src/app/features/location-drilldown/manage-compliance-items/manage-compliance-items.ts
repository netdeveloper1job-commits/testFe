import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ENDPOINTS } from '../../../core/endpoints';
import { ComplianceConfig } from '../../../core/models/compliance-config';
import { ApiResponse } from '../../../core/models/api-response';
import { User } from '../../../core/models/users';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-compliance-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-compliance-items.html',
  styleUrl: './manage-compliance-items.scss',
})
export class ManageComplianceItems implements OnInit {
  locationId: number | null = null;
  locationName = '';
  complianceCategoryId: number | null = null;
  trackerRecord: any = null;
  complianceConfigs: ComplianceConfig[] = [];
  users: User[] = [];
  form!: FormGroup;
  submitted = false;
  isSubmitting = false;
  showUpdateButton = false;
  selectedIfAppliedFileName = '';
  selectedCertificateFileName = '';
  certificatePreview: string | null = null;
  ifAppliedPreview: string | null = null;
  env = environment.api_url;

  get isAppliedSelected(): boolean {
    return this.form.get('activity')?.value === 'Applied';
  }

  get isCompletionDateSelected(): boolean {
    const completionDate = this.form.get('complianceCompletionDate')?.value;
    return !!(completionDate && `${completionDate}`.trim() !== '');
  }

  get isCertificateEnabled(): boolean {
    const activity = this.form.get('activity')?.value;
    return activity === 'Compliant';
  }

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.listenComplianceItemChanges();
    this.setupConditionalValidation();

    if (this.complianceCategoryId) {
      this.getComplianceConfigsByComplianceCategoryId(this.complianceCategoryId);
    }

    this.getAllUsers();

    if (this.trackerRecord?.id) {
      this.showUpdateButton = true;
      this.patchTrackerForm();
    }
  }

  createForm(): void {
    this.form = this.fb.group({
      locationName: [{ value: this.locationName, disabled: true }],
      complianceConfigId: ['', Validators.required],
      riskCategory: [{ value: '', disabled: true }], // Removed required on disabled field
      userId: ['', Validators.required],
      dueDate: ['', Validators.required],
      activity: ['', Validators.required],
      complianceCategoryId: [this.complianceCategoryId, Validators.required],
      ifApplied: [''],
      complianceCompletionDate: [''],
      certificateURL: [''],
    });
  }

  setupConditionalValidation(): void {
    this.form.get('activity')?.valueChanges.subscribe((activity) => {
      const ifAppliedControl = this.form.get('ifApplied');
      const completionDateControl = this.form.get('complianceCompletionDate');
      const certificateControl = this.form.get('certificateURL');

      if (activity === 'Applied') {
        // Only Applied file (disable Completion Date + Certificate)
        ifAppliedControl?.setValidators([Validators.required]);
        completionDateControl?.disable({ emitEvent: false });
        completionDateControl?.setValue('');
        certificateControl?.clearValidators();
        certificateControl?.setValue('');
        this.certificatePreview = null;

      } else if (activity === 'Compliant') {
        // Completion date + certificate
        completionDateControl?.enable({ emitEvent: false });

        ifAppliedControl?.setValue('');
        ifAppliedControl?.clearValidators();

        if (completionDateControl?.value) {
          certificateControl?.setValidators([Validators.required]);
        }

        this.ifAppliedPreview = null;

      } else {
        // Not Applied
        ifAppliedControl?.setValue('');
        completionDateControl?.setValue('');
        certificateControl?.setValue('');

        completionDateControl?.disable({ emitEvent: false });

        ifAppliedControl?.clearValidators();
        certificateControl?.clearValidators();

        this.ifAppliedPreview = null;
        this.certificatePreview = null;
      }

      ifAppliedControl?.updateValueAndValidity({ emitEvent: false });
      completionDateControl?.updateValueAndValidity({ emitEvent: false });
      certificateControl?.updateValueAndValidity({ emitEvent: false });

      this.cdr.detectChanges();
    });

    // Certificate logic (only for Compliant)
    this.form.get('complianceCompletionDate')?.valueChanges.subscribe((date) => {
      const certificateControl = this.form.get('certificateURL');
      const activity = this.form.get('activity')?.value;

      if (date && activity === 'Compliant') {
        certificateControl?.setValidators([Validators.required]);
      } else {
        certificateControl?.clearValidators();
        certificateControl?.setValue('');
        this.certificatePreview = null;
      }

      certificateControl?.updateValueAndValidity({ emitEvent: false });
      this.cdr.detectChanges();
    });
  }

  patchTrackerForm(): void {
    const record = this.trackerRecord;
    const normalizedCompletionDate = this.normalizeOptionalDate(record?.complianceCompletionDate);

    this.form.patchValue({
      complianceConfigId: record?.complianceConfigId ?? '',
      riskCategory: record?.complianceConfig?.riskCategory ?? '',
      userId: record?.userId ?? record?.responsibilityId ?? '',
      dueDate: this.normalizeDateForInput(record?.dueDate),
      activity: record?.activity ?? record?.status ?? '',
      ifApplied: record?.doc ?? record?.ifApplied ?? '',
      complianceCompletionDate: normalizedCompletionDate,
      certificateURL: record?.complianceCertificate ?? record?.certificateURL ?? '',
      complianceCategoryId: record.complianceCategoryId
    });

    this.certificatePreview = record?.complianceCertificate || record?.certificateURL || null;
    this.ifAppliedPreview = record?.doc || record?.ifApplied || null;

    // Sync validation state with patched values
    this.form.get('activity')?.setValue(record?.activity ?? record?.status ?? '', { emitEvent: true });
    this.form
      .get('complianceCompletionDate')
      ?.setValue(normalizedCompletionDate, { emitEvent: true });
  }

  detectCertificateFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.apiService.postFormData<ApiResponse<any>>(ENDPOINTS.FILE_UPLOAD.UPLOAD_IMAGE, formData).subscribe({
      next: (res) => {
        const url = res?.data?.filePath ?? res?.data?.path ?? res?.data?.url ?? '';
        this.form.patchValue({ certificateURL: url });
        this.certificatePreview = url; // Set preview immediately
        this.cdr.detectChanges();
      },
      error: () => this.commonService.showtoaster('Error', 'Certificate upload failed.')
    });
  }

  detectIfAppliedFiles(event: Event): void {
    if (!this.isAppliedSelected) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.apiService.postFormData<ApiResponse<any>>(ENDPOINTS.FILE_UPLOAD.UPLOAD_IMAGE, formData).subscribe({
      next: (res) => {
        const url = res?.data?.filePath ?? res?.data?.path ?? res?.data?.url ?? '';
        this.form.patchValue({ ifApplied: url });
        this.ifAppliedPreview = url; // Set preview immediately
        this.cdr.detectChanges();
      },
      error: () => this.commonService.showtoaster('Error', 'Applied proof upload failed.')
    });
  }

  saveComplianceTracker(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.isSubmitting = true;
    const raw = this.form.getRawValue();
    const payload = {
      locationId: this.locationId,
      complianceConfigId: Number(raw.complianceConfigId),
      userId: Number(raw.userId),
      dueDate: raw.dueDate,
      activity: raw.activity,
      doc: raw.ifApplied,
      complianceCompletionDate: raw.complianceCompletionDate || null,
      complianceCertificate: raw.certificateURL,
      complianceCategoryId: this.complianceCategoryId || raw.complianceCategoryId
    };

    const request$ = this.showUpdateButton
      ? this.apiService.put(ENDPOINTS.COMPLIANCE_TRACKER.UPDATE(this.trackerRecord.id), payload)
      : this.apiService.post(ENDPOINTS.COMPLIANCE_TRACKER.CREATE, payload);

    request$.subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Tracker saved successfully.');
        this.bsModalRef.hide();
      },
      error: () => (this.isSubmitting = false)
    });
  }

  // ... (Keep existing getComplianceConfigsByComplianceCategoryId, getAllUsers, cancel, etc.)
  getComplianceConfigsByComplianceCategoryId(id: number): void {
    this.apiService.get<ApiResponse<ComplianceConfig[]>>(ENDPOINTS.COMPLIANCE_CONFIG.BY_COMPLIANCE_CATEGORY(id)).subscribe(res => {
      this.complianceConfigs = res.data || [];
      this.cdr.detectChanges();
    });
  }

  getAllUsers(): void {
    this.apiService.get<ApiResponse<User[]>>(ENDPOINTS.USERS.VIEW_ALL).subscribe(res => {
      this.users = res.data || [];
      this.cdr.detectChanges();
    });
  }

  listenComplianceItemChanges(): void {
    this.form.get('complianceConfigId')?.valueChanges.subscribe(val => {
      const item = this.complianceConfigs.find(i => i.id === Number(val));
      this.form.patchValue({ riskCategory: item?.riskCategory ?? '' });
    });
  }

  getComplianceItemLabel(item: ComplianceConfig): string {
    return item.complianceItem?.trim() || item.complianceCategoryName?.trim() || `Item ${item.id}`;
  }

  private normalizeDateForInput(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const rawValue = `${value}`.trim();
    if (!rawValue) {
      return '';
    }

    return rawValue.length >= 10 ? rawValue.slice(0, 10) : rawValue;
  }

  private normalizeOptionalDate(value: string | null | undefined): string {
    const normalizedValue = this.normalizeDateForInput(value);

    if (!normalizedValue) {
      return '';
    }

    const sentinelDates = new Set(['1899-11-30', '1900-01-01', '0001-01-01']);
    return sentinelDates.has(normalizedValue) ? '' : normalizedValue;
  }

  cancel(): void {
    this.bsModalRef.hide();
  }
}
