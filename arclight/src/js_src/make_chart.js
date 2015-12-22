/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */

function make_chart_line_empty()
{
    make_chart_line( [] );
}


function make_series_guide( params )
{
    console.log( "make_series_guide: ", params );

    params['color'] = "#898B80";
    params['type'] = "line";
    params['stacking'] = false;
    params['dashStyle'] = "shortdot";
    params['animation'] = false;
    params['allowPointSelect'] = false;
    params['marker'] = { enabled: false };
    params['enableMouseTracking'] = false;

    return params;
}

function make_series( params )
{
    console.log( "Make Series: stacking: " + params['stacking'] );

    params['animation'] = false;
    params['stacking'] = ("stacking" in params) ? params['stacking'] : false;

    return params;
}


function make_chart_from_series( series, type )
{
    $(function () {
        $('#chart_area').highcharts({
            
            chart: {
                type: type,

                backgroundColor: colors_bg,
                lineColor:       colors_lines,
                grindLineColor:  colors_lines,

                animation: false,
            },            

            credits: {
                enabled: true,
                text: 'projectarclight.org',
                href: 'http://projectarclight.org'
            },

            title: {
                text: ''
            },

            xAxis: {
                minPadding: 0.05,
                maxPadding: 0.05,
                title: '',

                lineColor: colors_lines,
                tickColor: colors_lines,
            },

            yAxis: {
                min: 0,
                /*minTickInterval: 1,*/
                title: '',

                gridLineColor: colors_lines,
            },

            series: series,

/*            tooltip: {
                formatter: function () {
                    tooltip = ""

                    return 'The value for <b>' + this.x +
                        '</b> is <b>' + this.y + '</b>';
                }
            },
*/
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                window.open(this.options.url);
                                //location.href = this.options.url;
                            }
                        }
                    }
                },
            },

            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },

        });
    }); 
}
