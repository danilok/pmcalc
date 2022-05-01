import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  labels: string[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

export type ChartOptionsBar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

export interface PmRow {
  qtd: number;
  amount: string;
  qtdTotal: number;
  newpm: string;
  vlTotal: string;
  pm: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'pmcalc';
  myForm: FormGroup;

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptionsBar: Partial<ChartOptionsBar>;

  @ViewChild(MatTable) table: MatTable<PmRow>;

  @Output() selectedTabChange: EventEmitter<MatTabChangeEvent>;

  public calculado: PmRow[] = [];

  public selectedTab = 0;

  displayedColumns: string[] = [
    'qtd',
    'amount',
    'qtdTotal',
    'vlTotal',
    'newpm',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe) {
      this.chartOptions = {
        series: [
          {
            name: "PM",
            data: []
          }
        ],
        chart: {
          type: "area",
          height: 350,
          width: '95%',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "straight"
        },
  
        title: {
          text: "Preço Médio",
          align: "left"
        },
        subtitle: {
          text: "Evolução de preço médio em gráfico de área",
          align: "left"
        },
        labels: [],
        xaxis: {
          type: 'numeric'
        },
        yaxis: {
          opposite: false
        },
        legend: {
          horizontalAlign: "left"
        }
      };

      this.chartOptionsBar = {
        series: [
          {
            name: "Preço Médio",
            data: []
          },
        ],
        chart: {
          type: "bar",
          height: '800',
          width: '98%',
        },
        plotOptions: {
          bar: {
            barHeight: '100%',
            horizontal: true,
            dataLabels: {
              position: "bottom"
            },
          }
        },
        title: {
          text: "Preço Médio",
          align: "left"
        },
        subtitle: {
          text: "Evolução de preço médio",
          align: "left"
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"]
        },
      };
  }

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
    const maxIteration = values.iterations * values.iteration;
    for (let i = 0; i <= maxIteration; i+=values.iteration) {
      const aux = ( ( ( values.price * i ) + ( values.currentQty * values.currentAveragePrice) ) / ( i + values.currentQty ) );
      const npm = this.currencyPipe.transform(aux, 'BRL');
      const amount = this.currencyPipe.transform(values.price * i, 'BRL');
      const qtdTotal = i + values.currentQty;
      const vlTotal = this.currencyPipe.transform(aux * qtdTotal, 'BRL');
      let nl: PmRow = { 
        qtd: i, 
        qtdTotal,
        amount,
        newpm: npm,
        vlTotal,
        pm: aux
      }
      this.calculado.push(nl);

      this.renderData();
    }


  }

  myTabSelectedTabChange(changeEvent: MatTabChangeEvent) {
    this.selectedTab = changeEvent.index;
    this.renderData();
  }
  
  renderData() {
    if (!this.calculado.length) {
      return;
    }

    switch (this.selectedTab) {
      case 0:
        this.table.renderRows();
        break;
      case 1:
        this.chartOptions.series = [
          {
            name: "Preço Médio",
            type: "area",
            data: this.calculado.map((item) => parseFloat(item.pm.toFixed(2)))
          },
        ];
        this.chartOptions.xaxis = {
          type: 'numeric',
          categories: this.calculado.map((item) => item.qtd)
        } 
        
        this.chartOptionsBar.series = [
          {
            name: "Preço Médio",
            data: this.calculado.map((item) => parseFloat(item.pm.toFixed(2)))
          },
        ]
        this.chartOptionsBar.xaxis = {
          type: 'numeric',
          categories: this.calculado.map((item) => item.qtd),
        } 
        break;
    }
  }
}
