import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { 'range': true };
    }
    return null;
  }
}


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  valMessage: string;

  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }

  private validationMessages = {
    required: ' Please enter your first name.',
    minlength: 'Please enter minimum 3 characters.'
  };
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: '',
      email: '',
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addresses: this.fb.array([this.buildAddress()])

    });

    const firstNameControl = this.customerForm.get('firstName');
    firstNameControl.valueChanges.pipe(debounceTime(1000)).subscribe(val =>
      this.setMessage(firstNameControl)
    );

    this.customerForm.get('notification').valueChanges.subscribe(val => this.setNotification(val));
  }

  save() {

  }

  addAddress(): void {
    this.addresses.push(this.buildAddress());
  }

  buildAddress(): FormGroup {
    return this.fb.group({
      streetaddress1: ['', Validators.required],
      streetaddress2: ''
    });
  }

  populateTestData() {
    this.customerForm.patchValue(
      {
        firstName: 'Puru'
      });
  }

  setMessage(c: AbstractControl): void {
    this.valMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.valMessage = Object.keys(c.errors).map(
        key => this.valMessage += this.validationMessages[key]).join(' ');
    }
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    }
    else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

}
