/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */

var year_min  = 1885;
var year_max  = 1975;

var year_range_start  = year_min;
var year_range_end    = year_max;

var search_term = "";

var max_by_year = null;

function series_update( params )
{
    var chart = $('#chart_area').highcharts();

    var name   = params['name'];
    var series = params['series'];

    console.log( "Updating series: " + series + " : " + name );

    chart.series[series].update( { 
            name: name,
            data: params['data'],
        } );

}

function series_set_data( series, data )
{
    console.log( "Series set data: " + series );

    var chart = $('#chart_area').highcharts();
    chart.series[series].setData ( data, true, false );

}

function series_add( params )
{

    var chart = $('#chart_area').highcharts();

    //var series = params['series'];
    var data = params['data'];
    var name = params['name'];


    console.log( "Add series: " + name );

    chart.addSeries( { name: name, data: data }, true, false );

}

function toggle_series( series )
{
    var chart = $('#chart_area').highcharts();
    if( chart.series[series].visible )  chart.series[series].hide();
    else                                chart.series[series].show();
}

function get_data_reshaped_by_years( data )
{
    // quickly reparse the data:
    var reshaped = {};
    for( var i in data )
    {
        var year = data[i]['x'];
        var val = data[i]['y'];

        //console.log( "add: " + year + " : " + val );
        reshaped[ year ] = val;
    }

    return reshaped;
}