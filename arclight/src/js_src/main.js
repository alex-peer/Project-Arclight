/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */


var series = [];
var series_max_guide = null;
var all_journals     = null;

var show_max_guide  = false;
var show_percent    = false;
var show_normalized = false;
var show_stacked    = false;

var chart_type = "line";  var stacking = false; 
//var chart_type = "area";    var stacking = true;

var chart = null; 

// journal search state stuff
var journals_main_filter = [];

//var journals = 'Radio Mirror';

function parse_queries( queries )
{
    queries = queries.split("\n");    
    //console.log( queries );

    var first_number = series.length;

    for( var i in queries )
    {    
        var number = series.length;
        series.push( {    'name' : queries[i],
                         'query' : queries[i], 
                        'number' : number,
                        'color'  : colors_series[number % colors_series.length],
                        'status' : "preload", //TODO: replace with enum?

                        'filter:journals' : [],
                     }
                   );
        update_or_add_series_controls( series[ number ] );
    }
    //    console.log( "Query registered : " + queries[i] );

    load_series( first_number, true );

    // clear search box
    $( "#input_query" ).val('');
    $('textarea').change();
}

function parse_query_box()
{
    // grab search box contents; split terms on newline
    var queries = $( "#input_query" ).val();
    parse_queries( queries );
}


function update_or_add_series_controls( this_series )
{
    var s = $("#series_" + this_series['number']);
    console.log( "Finding #series_" + this_series['number'] + " : " + s.length );

    name = name in this_series ? this_series['name'] : this_series['query'];

    var id = "series_" + this_series['number'];

    //TODO: could use handlebars instead, but is that worth loading?
    html = div({ "id" : id, "class" : "series" },
           [

                div( {"class":"series_tools", "style":"display:none;"}, 
                     [

                         div( {"class":"btn_remove_series button small"}, 
                              svg( "img/icon_remove_series" ) ),

                         div( {"class":"btn_hide_series button small"}, 
                              svg( "img/icon_hide_series" ) ),
                     ] 
                   ),

                div({"class":"loading_indicator"}, "Loading..."),

                div({"class":"series_inner"}, 
                    [
                        div( {"class":"name"}, html_encode(name) ),

                        div( { "class":"color_selection", 
                               "style":""//"border-color:"+series['color']+";"
                              +"background-color:"+ this_series['color']+";",
                             }),
                    ]),
           ]                    
        );

    // add series if it doesn't exist
    if( s.length == 0 )
    {
        console.log( "\tSeries not found, adding new series controls ...")
        s = $("#search_column > #series_widgets").prepend( html );    
    }
    else
        s.html( html );


    var div_series = $("#"+id);
    var div_tools = $("#"+id + " .series_tools");
    var div_name = $("#"+id + " .name");

    // add logic to hide / show edit buttons
    var fade_time = 250;
    div_series.hover( function() { 

                        //tools.toggle(); 
                        div_tools.fadeIn(fade_time);

                        var top  = div_tools.parent().height()/2 - div_tools.height()/2;
                        var left = div_tools.parent().width()/2 - div_tools.width()/2;
                        div_tools.css({ top: top, left: left }) ;
                        //console.log( $("#"+id + " .series_tools").html() );

                        //name.css('visibility','hidden');

                        div_name.fadeTo(fade_time,0);
                    },
                    function() {   

                        //tools.toggle(); 
                        div_tools.fadeOut(fade_time);

                        //name.css('visibility','visible');
                        div_name.fadeTo(fade_time,1);
                    });

    // add logic for remove button    
    $("#"+id + " .series_tools .btn_remove_series").click(
            function() {
                div_series.remove();
                //series.splice(index, series['number'])
                delete series[ this_series['number'] ];
                //TODO: may need beter handling for this case; may need to find first unassigned index on insert, or maintain list of holes?

                update_chart();
            }
        );

    // add logic for disable series toggle
    $("#"+id + " .series_tools .btn_hide_series").click(
            function() {
                div_series.toggleClass( "disabled" );
                series[ this_series['number'] ][ "user_is_active" ] = !series[ this_series['number'] ][ "user_is_active" ];

                update_chart();
            }
        );
}


var last_chart_update = $.now();
var update_requested = false;
var is_updating = false;

function really_really_update_chart()
{
    var i;
    //TODO: somehow copy less?
    var active_series = [];

    if( show_max_guide )    active_series.push( series_max_guide );

    for( i in series )
    {
        //console.log( "\t"+ series[i]["name"] +" : "+ series[i]["status"] );
        if( series[i]["status"] != "loaded" )
        {   
           // console.log( "\t\t NOT LOADED" );
            continue;
        }

        //console.log( "Series is active: "+ i +", "+ series[i]["user_is_active"] )
        if( series[i]["user_is_active"] ) // && series[i]["code_is_active"] )
        {    
            if(show_stacked) 
            { series[i]['type'] = 'area'; series[i]['stacking'] = true; }
            else
            { series[i]['type'] = 'line'; series[i]['stacking'] = false; }

            active_series.push( series[i] );
        }
    }

    if( show_normalized )
    {
        console.log("normalizing data");
        for( i in active_series )
        {
            console.log("\t name : " + active_series[i]['name']);
            console.log("\t has data? : " + ('data' in active_series[i]));
            console.log("\t has raw? : " + ('data_raw' in active_series[i]));
            console.log("\t has norm? : " + ('data_normalized' in active_series[i]));
            console.log("\t entries in raw : " + active_series[i]['data_raw'].length);
            if( 'data_normalized' in active_series[i] == false )
            {
                console.log("\t building norm: ");
                active_series[i]['data_normalized'] = [];

                for( j in active_series[i]['data_raw'] )
                {
                    console.log("\t\t raw: " + j);
                    year  = active_series[i]['data_raw'][j]['x'];
                    value = active_series[i]['data_raw'][j]['y'];
                    url = active_series[i]['data_raw'][j]['url'];
                    
                    if(value != null)
                        value = value / max_by_year[year];

                    active_series[i]['data_normalized'].push( 
                        {
                            'x': year,
                            'y': value,
                            "url": url,
                        }
                        );

                    console.log(  "value: "+ active_series[i]['data_raw'][j]['y'] 
                                 +" normed: "+ value 
                               );
                }
            }

            console.log("\t entries in norm : " + active_series[i]['data_normalized'].length);

            active_series[i]['data'] = active_series[i]['data_normalized'];
        }
    }
    else
    {        
        for( i in active_series )
        {
            active_series[i]['data'] = active_series[i]['data_raw'];
        }
    }


    console.log( "Active series count: "+ active_series.length );

    make_chart_from_series( active_series );

    //if( show_normalized )
    //    $('#chart_area').highcharts

    $('#chart_area').css('visibility', 'visible');

    chart = $('#chart_area').highcharts();

    $('#chart_area').highcharts().xAxis[0].setExtremes(year_range_start, year_range_end);

    populate_export_modes();
}

function really_update_chart()
{
    is_updating = true;

    really_really_update_chart();

    last_chart_update = $.now();
    update_requested = false;

    is_updating = false;
}

function update_chart()
{
    // limit how often this is called

    // if called when already updating, lock:
    //  try again in a bit
    if( is_updating )
    {
        console.log("UpdateChart: already updating");
        setTimeout( update_chart(), 100 );
        return;
    }

    // if called too quickly since last update, throttle:
    //  register request, and drop this request if another gets through in the meantime
    var now = $.now();
    if( now - last_chart_update < 200 )
    {
        console.log("UpdateChart: throttle");
        update_requested = true;
        setTimeout( function() 
                    {
                        if( update_requested && !is_updating )
                        {
                            console.log("UpdateChart: updating after throttle");
                            really_update_chart();
                        }
                    },
                    200
                  );
    }
    else
    {
        console.log("UpdateChart: updating");
        really_update_chart();
    }
}


function load_series( series_number, load_next_after )
{

    console.log( "SERIES START: " + series_number +" of "+ series.length );
    var i = series_number;

    if( series_number >= series.length )
    {
        console.log( "\tSeries out of bounds ..." );
        return;
    }    

    if( load_next_after == undefined )  load_next_after = false;

    series[i]['status'] = "loading";

    var id = "#series_" + i;
    $(id).addClass( "loading" );




    (function(i) {
        send_query({        "text" : series[i]['query'],
                        "journals" : series[i]['filter:journals'].concat( journals_main_filter ),
                      //"year_start" : year_range_start,
                      //  "year_end" : year_range_end,
                          "onDone" : function(data_xml) 
                            {    
                                j = i;
                                console.log( "SERIES DONE: " + series_number );
                                data = parse_data(  data_xml, 
                                                    series[j]['query'], 
                                                    series[j]['filter:journals'] 
                                                 );
                                console.log( data );

                                series[j]['data_raw'] = data['data'];
                                series[j]['data'] = series[j]['data_raw'];
                                series[j]['stacking'] = stacking;

                                //for( i in data )
                                //{
                                //    series[i]['data_normalized'].push(
                                //        {   'x': data['data']['x'],
                                //            'y': 
                                //        ); = data['data'];
                                //}


                                console.log( series[j] );
                                series[j] = make_series( series[j] );

                                console.log( "query returned: " + series[j] );

                                //if(onFinish != null ) onFinish();
                                series[j]['status'] = "loaded";

                                series[j]['user_is_active'] = true;
                                //series[i]['is_active'] = true;

                                $("#series_" + j).removeClass( "loading" );

                                update_chart(); //TODO: register chart as dirty, catch update every few millis

                                if( load_next_after == true && series_number < series.length )
                                {
                                    load_series( series_number + 1, true );
                                }
                           },
                  });
    })(i);
}

function get_guide()
{
    //TODO: handle error
    // guide
    send_query({        "text" : "",
                      "onDone" : function(data_xml) {    
                            data = parse_data( data_xml, "" );
                            series_max_guide = {   name : "max",
                                                   data_raw : data['data'],
                                               };
                            series_max_guide['data'] = series_max_guide['data_raw'];
                            series_max_guide = make_series_guide( series_max_guide )

                            all_journals = data['journals'];

                            //console.log( "all journals: ", all_journals );

                            console.log( "series guide query returned: " + series_max_guide ); 
                            //console.log( "series guide query returned: " + series_max_guide['data_raw'] ); 

                            max_by_year = get_data_reshaped_by_years( data['data'] );

                            after_initial_load();
                            
                            //console.log( max_by_year );
                            //$("body").append( JSON.stringify( max_by_year ) );

                            //console.log( data['journals'] ); 
                            //for( i in data['journals'] )
                            //{
                            //    text = "<p>" + data['journals']['title'] + ", " + data['journals']['count'] +"</p>";
                            //    console.log( text );
                            //    $("body").append( text );
                            //}
                        }
    });
}

function update_guide_filtered()
{
   
    $("#loading_overlay").show();

   send_query({        "text" : "",
                       "journals" : journals_main_filter,
                  "onDone" : function(data_xml) {    
                        data = parse_data( data_xml, "" );
                        series_max_guide = {   name : "max",
                                               data_raw : data['data'],
                                               "filter:journals" : journals_main_filter,
                                           };
                        series_max_guide['data'] = series_max_guide['data_raw'];
                        series_max_guide = make_series_guide( series_max_guide );

                        console.log( "series guide update query returned: " + series_max_guide ); 
                        //console.log( "series guide query returned: " + series_max_guide['data_raw'] ); 

                        max_by_year = get_data_reshaped_by_years( data['data'] );

                        //$("#loading_overlay").stop(true, true);
                        //$("#loading_overlay").fadeOut( 400, function() { update_chart(); } );

                        $("#loading_overlay").fadeOut(  );


                        for(var i in series)
                        {   
                            series[i]['status'] = "loading";

                            var id = "#series_" + i;
                            $(id).addClass( "loading" );
                            
                        } 
                        //for(var i in series)
                        //{
                        //    (function(i) {
                        load_series( 0, true );
                        //    })(i);
                        //} 
                    } 
            });
}

function update_all_with_new_filter()
{
    update_guide_filtered();

    /*
    for(i in series)
    {
        load_series( i );
    }
    */
}

function after_initial_load()
{


    $("#loading_overlay").fadeOut();//.modal('hide');

    init_journal_search();


//DEBUG//
    //parse_queries( "hats" );
    //$('#chart_area').css('visibility', 'visible');
    //setTimeout( function() { start_main_journal_search(); }, 100 );
    //parse_queries( "gargantuan" );
    //parse_queries( "cats" );
    //parse_queries( "rats" );
//DEBUG//
}

function init_ui() 
{
        $("#loading_overlay").show();//.modal({ backdrop:"static" });
        

        //make_chart_line_empty();

        $('#btn_search').click(  function() { parse_query_box();            } );
        $('#btn_calendar').click( function() { 
            $('#year_selection_area').toggle();  
            $('#btn_calendar').toggleClass('active');
        } );

//TODO: active class should reflect toggle var state directly
        $('#btn_max_guide').click( function() { 
                                        //toggle_series( 0 );
                                        $('#btn_max_guide').toggleClass( 'active' );
                                        show_max_guide = ! show_max_guide;
                                        update_chart();
                                    } );

        $('#btn_normalize').click( function() 
            {   show_normalized = !show_normalized; 
                update_chart(); 
                $('#btn_normalize').toggleClass( 'active' );
            } );

        $('#btn_stack').click( function() 
            {   show_stacked = !show_stacked; 
                update_chart(); 
                $('#btn_stack').toggleClass( 'active' );
            } );

        $("#btn_journal_filter").click( function()
            {   //$('#btn_journal_filter').toggleClass( 'active' );   
                //$('#journal_filter_area').modal();

                //init_journal_search();
                start_main_journal_search();
            });


        $("#btn_export").click( function()
            {   
                $('#export_area').modal();
            });


        $( "#input_query" ).keypress( function (e) 
            {
                if (e.which == 13) 
                {
                    parse_query_box();
                    return false;
                }
            });




        $('input#start_date').val( year_range_start );
        $('input#end_date').val( year_range_end );

        $('input#start_date').change( function() {
                year_range_start = $('input#start_date').val();
                chart.xAxis[0].setExtremes(year_range_start, year_range_end);
            })
        $('input#end_date').change( function() {
                year_range_end = $('input#end_date').val();
                chart.xAxis[0].setExtremes(year_range_start, year_range_end);
            })


}

function populate_export_modes()
{
    console.log( "Populate chart export options." );

    /*
    $(".chart-export").each( function() 
    {

        var chartSelector = $("#chart_area");
        var chart = $(chartSelector).highcharts();

        $("*[data-type]", this).each( function() 
        {

            var jThis = $(this);
            var type = jThis.data("type");

            console.log("\t type: " + type );

            if(Highcharts.exporting.supports(type)) 
            {
                jThis.click( function() {
                    chart.exportChartLocal({ type: type });
                });
            }
            else 
            {
                jThis.attr("disabled", "disabled");
            }

        });

    });
    */



    $(".btn-svg-export").click( function () { serverside_export_chart( 'image/svg+xml' );  } );
    $(".btn-PNG-export").click( function () { serverside_export_chart( 'image/png' );  } );
    $(".btn-JPEG-export").click( function () { serverside_export_chart( 'image/jpeg' );  } );
    $(".btn-PDF-export").click( function () { serverside_export_chart( 'application/pdf' );  } );
    $("#btn-CSV-export").click( function () { download_csv();  } );
    //$(".btn-XLS-export").click( function () { serverside_export_chart( 'application/vnd.ms-excel' );  } );

    $(".btn-print-chart").click( function () { $('#chart_area').highcharts().print(); } );
}

function download_csv()
{
    console.log( "Export CSV ..." );
    var chart = $('#chart_area').highcharts();
    $("#btn-CSV-export").attr( 'href', 'data:text/csv;charset=utf-8,' + escape( chart.getCSV() ) ); 
    $("#btn-CSV-export").attr( 'download', "export.csv" );
    //$("#btn-CSV-export").click();
}

function serverside_export_chart( mime_type )
{
    console.log("export chart: " + mime_type );
    var chart = $('#chart_area').highcharts();
    chart.exportChart( { type: mime_type } );
    //chart.exportChart( { type: 'application/pdf' } );
}

// center bootstrap modals
$(function() {

    function reposition() {

        var modal  = $(this);
        var dialog = modal.find(".modal-dialog");

        modal.css( "display", "block" );        
        dialog.css( "margin-top", 
                    Math.max( 0, ( $(window).height() - dialog.height() ) / 2) 
                  );
    }

    // call on: show modal
    $(".modal").on( "show.bs.modal", reposition );

    // call on: window resize
    $(window).on( "resize", function() {
            $( ".modal:visible" ).each( reposition );
        });

});