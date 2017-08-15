// Definitions of rapportage charts.
// TODO FB: these are mockups, create actual charts.
function rapportage_chart_one() {
  Highcharts.chart('chart-fietsersbond', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Fietsersbond Rapportage Mock-up'
    },
    xAxis: {
      categories: [
        'Utrecht',
        'Amsterdam',
        'Rotterdam'
      ]
    },
    yAxis: [{
      min: 0,
      title: {
        text: 'Problemen'
      }
    }, {
      title: {
        text: 'Ideeën'
      },
      opposite: true
    }],
    legend: {
      shadow: false
    },
    tooltip: {
      shared: true
    },
    plotOptions: {
      column: {
        grouping: false,
        shadow: false,
        borderWidth: 0
      }
    },
    series: [{
      name: 'Problemen',
      color: 'rgba(165,170,217,1)',
      data: [150, 73, 20],
      pointPadding: 0.3,
      pointPlacement: -0.2
    }, {
      name: 'Opgeloste problemen',
      color: 'rgba(126,86,134,.9)',
      data: [90, 43, 18],
      pointPadding: 0.4,
      pointPlacement: -0.2
    }, {
      name: 'Ideeën',
      color: 'rgba(248,161,63,1)',
      data: [123, 178, 198],
      tooltip: {
        valuePrefix: '',
        valueSuffix: ''
      },
      pointPadding: 0.3,
      pointPlacement: 0.2,
      yAxis: 1
    }, {
      name: 'Uitgevoerde ideeën',
      color: 'rgba(186,60,61,.9)',
      data: [90, 85, 178],
      tooltip: {
        valuePrefix: '',
        valueSuffix: ''
      },
      pointPadding: 0.4,
      pointPlacement: 0.2,
      yAxis: 1
    }]
  });
}
function rapportage_chart_two() {
}
function rapportage_chart_three() {
}
