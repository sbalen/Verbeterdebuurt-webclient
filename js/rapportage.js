// Definitions of rapportage charts.
// TODO FB: these are mockups, create actual charts.
// TODO FB: if the proposed layout is accepted, replace add/removeClass
// logic with proper angular watched variables.
function rapportage_show_details() {
  $('#rapportage-main-panel').addClass('enabled');
  Highcharts.chart('chart-fietsersbond', {
    chart: { type: 'line' },
    title: { text: 'Nieuwe/behandelde meldingen' },
    subtitle: { text: 'Gemiddelde doorlooptijd 22 dagen, gemiddelde feedback 4*' },
    xAxis: { type: 'datetime', title: { text: 'Datum' } },
    yAxis: { title: { text: 'Aantal' }, min: 0 },
    tooltip: { shared: true, },
    series: [{
      name: 'Nieuw',
      data: [
        [Date.UTC(2017, 1, 1), 12],
        [Date.UTC(2017, 2, 1), 25],
        [Date.UTC(2017, 3, 1), 35],
        [Date.UTC(2017, 4, 1), 27],
        [Date.UTC(2017, 5, 1), 84],
        [Date.UTC(2017, 6, 1), 43],
        [Date.UTC(2017, 7, 1), 32],
        [Date.UTC(2017, 8, 1), 46],
      ]
    }, {
      name: 'Behandeld',
      data: [
        [Date.UTC(2017, 1, 1), 22],
        [Date.UTC(2017, 2, 1), 15],
        [Date.UTC(2017, 3, 1), 25],
        [Date.UTC(2017, 4, 1), 21],
        [Date.UTC(2017, 5, 1), 54],
        [Date.UTC(2017, 6, 1), 49],
        [Date.UTC(2017, 7, 1), 12],
        [Date.UTC(2017, 8, 1), 33],
      ]
    }]
  });
  Highcharts.chart('chart-fietsersbond-secondary', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: { text: 'Soort melding', },
    tooltip: { pointFormat: '{series.name}: <b>{point.y}</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    },
    series: [{
      name: 'Soort',
      colorByPoint: true,
      data: [{
        name: 'Probleem',
        y: 87,
      }, {
        name: 'Idee',
        y: 45,
        sliced: true,
        selected: true
      }, {
        name: 'Campagne X',
        y: 17 
      }, {
        name: 'Campagne Y',
        y: 38 
      }, {
        name: 'Anders',
        y: 5
      }]
    }]
  });
}
function rapportage_hide_details() {
  $('#rapportage-main-panel').removeClass('enabled');
}
function rapportage_chart_one() {
  Highcharts.chart('chart-fietsersbond', {
    chart: {
      type: 'spline'
    },
    title: {
      text: 'Meldingen over tijd'
    },
    subtitle: {
      text: 'Fiets-meldingen afgezet tegen het totaal'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%e. %b',
        year: '%b'
      },
      title: {
        text: 'Tijd'
      }
    },
    yAxis: {
      title: {
        text: 'Aantal'
      },
      min: 0
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.x:%e. %b}: {point.y}'
    },

    plotOptions: {
      spline: {
        marker: {
          enabled: true
        }
      }
    },

    series: [{
      name: 'Fiets meldingen',
      // Define the data points. All series have a dummy year
      // of 1970/71 in order to be compared on the same x axis. Note
      // that in JavaScript, months start at 0 for January, 1 for February etc.
      data: [
        [Date.UTC(1970, 10, 27), 2],
        [Date.UTC(1970, 11, 2), 28],
        [Date.UTC(1970, 11, 26), 28],
        [Date.UTC(1970, 11, 29), 47],
        [Date.UTC(1971, 0, 11), 79],
        [Date.UTC(1971, 0, 26), 72],
        [Date.UTC(1971, 1, 3), 102],
        [Date.UTC(1971, 1, 11), 112],
        [Date.UTC(1971, 1, 25), 12],
        [Date.UTC(1971, 2, 11), 118],
        [Date.UTC(1971, 3, 11), 119],
        [Date.UTC(1971, 4, 1), 185],
        [Date.UTC(1971, 4, 5), 222],
        [Date.UTC(1971, 4, 19), 115],
        [Date.UTC(1971, 5, 3), 0]
      ]
    }, {
      name: 'Totaal',
      data: [
        [Date.UTC(1970, 9, 21), 0],
        [Date.UTC(1970, 10, 4), 28],
        [Date.UTC(1970, 10, 9), 25],
        [Date.UTC(1970, 10, 25), 10],
        [Date.UTC(1970, 11, 6), 35],
        [Date.UTC(1970, 11, 20), 141],
        [Date.UTC(1970, 11, 25), 164],
        [Date.UTC(1971, 0, 4), 126],
        [Date.UTC(1971, 0, 17), 255],
        [Date.UTC(1971, 0, 24), 262],
        [Date.UTC(1971, 1, 4), 125],
        [Date.UTC(1971, 1, 14), 242],
        [Date.UTC(1971, 2, 6), 274],
        [Date.UTC(1971, 2, 14), 262],
        [Date.UTC(1971, 2, 24), 126],
        [Date.UTC(1971, 3, 2), 281],
        [Date.UTC(1971, 3, 12), 263],
        [Date.UTC(1971, 3, 28), 277],
        [Date.UTC(1971, 4, 5), 268],
        [Date.UTC(1971, 4, 10), 256],
        [Date.UTC(1971, 4, 15), 239],
        [Date.UTC(1971, 4, 20), 158],
        [Date.UTC(1971, 5, 5), 9],
        [Date.UTC(1971, 5, 10), 185],
        [Date.UTC(1971, 5, 15), 149],
        [Date.UTC(1971, 5, 23), 108]
      ]
    }]
  });
}

function rapportage_chart_two() {
  Highcharts.chart('chart-fietsersbond', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Problemen / Ideeën'
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

function rapportage_chart_three() {
  Highcharts.chart('chart-fietsersbond', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Tevredenheid over de afhandeling'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    },
    series: [{
      name: 'Aantal met deze mening',
      colorByPoint: true,
      data: [{
        name: 'Zeer Tevreden',
        y: 8,
      }, {
        name: 'Tevreden',
        y: 24,
        sliced: true,
        selected: true
      }, {
        name: 'Neutraal',
        y: 17 
      }, {
        name: 'Ontevreden',
        y: 12 
      }, {
        name: 'Zeer ontevreden',
        y: 3
      }]
    }]
  });
}
