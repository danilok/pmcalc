import { CurrencyPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';

export interface PmRow {
  qtd: number;
  total: number;
  newpm: string;
  vlTotal: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pmcalc';
  myForm: FormGroup;

  @ViewChild(MatTable) table: MatTable<PmRow>;

  calculado: PmRow[] = [];

  displayedColumns: string[] = ['qtd', 'total', 'newpm', 'vlTotal'];

  constructor(
    private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe) { }

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      price: ['', Validators.required],
      currentAveragePrice: ['', Validators.required],
      currentQty: ['', Validators.required],
      iterations: [100, Validators.required],
      iteration: [1, Validators.required],
    })
  }

  calcularPM() {
    const values = this.myForm.getRawValue();
    this.calculado = [];
    for (let i = 0; i <= values.iterations; i+=values.iteration) {
      const aux = ( ( ( values.price * i ) + ( values.currentQty * values.currentAveragePrice) ) / ( i + values.currentQty ) );
      const npm = this.currencyPipe.transform(aux, 'BRL');
      const qtdTotal = i + values.currentQty;
      const vlTotal = this.currencyPipe.transform(aux * qtdTotal, 'BRL');
      let nl: PmRow = { 
        qtd: i, 
        total: qtdTotal,
        newpm: npm,
        vlTotal }
      this.calculado.push(nl)
    }
    this.table.renderRows();
  }
}
