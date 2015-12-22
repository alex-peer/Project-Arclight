/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */

var colors_grey   = "#3e3f3a";
var colors_brown  = "#c8bdab";
var colors_red    = "#d1443b";
var colors_orange = "#c58433";

var colors_grey_light   = "#898B80";//"#4B4C46";
var colors_brown_light  = "#D5C9B6";

var colors_highlight = "#D5D8C7";

var colors_lines     = colors_grey_light;
var colors_bg        = colors_brown_light;
var colors_series    = [    colors_orange, 
                            "#BA2D57",
                            "#C8B30E",
                            "#97272A",
                            "#639436",
                            "#A5A213",
                            "#1788A2",
                            "#197C20",
                            "#552D63",
                            "#003E17",
                            "#1F577D",
                       ];

var arclight_year_min = 1890;
var arclight_year_max = 1965;

function make_lantern_url( params )
{
    // no query, just send to root website
    if( ! "query" in params )
    {
        return "http://lantern.mediahist.org/"
    }
    query = params['query'];
    year_begin  = "year_begin"  in params ? params['year_begin'] : arclight_year_min;
    year_end    = "year_end"    in params ? params['year_end']   : arclight_year_max;
    journals = ('filter:journals' in params) ? params['filter:journals'] : null;

    //Lantern can't do multi-journal queries?  Only use if one listed.
    //TODO: or perhaps it can?
    if( $.isArray(journals) && journals.length > 1 ) 
        journals = null;
    if( $.isArray(journals) )                        
        journals = journals[0];

    query      = encodeURIComponent( query );
    year_begin = encodeURIComponent( year_begin );
    year_end   = encodeURIComponent( year_end );
    if(journals != null)    journals = encodeURIComponent( journals );

    if( journals != null && $.isArray(journals) )
    {
        console.log( "Journals was: " + journals.length );
        console.log( journals );
    }
    else if( journals != null )
    {        
        console.log( "Journals was: " + journals );
    }

    var url = "http://lantern.mediahist.org/catalog?";
    url += "utf8=%E2%9C%93&utf8=%E2%9C%93";
    url += "&";
    if(journals != null) url += "commit=Limit&f%5Btitle%5D%5B%5D=" + journals;
    url += "&";
    url += "q=" + query;
    url += "&";
    url += "search_field=dummy_range";
    url += "&";
    url += "range%5Byear%5D%5Bbegin%5D=" + year_begin;
    url += "&";
    url += "range%5Byear%5D%5Bend%5D=" + year_end;
    url += "&";
    url += "commit=Limit";

    return url;
}

function send_query( params )
{
    var text_json = "";
    if( "text" in params )
    {
        var text = params["text"];
        text_json = JSON.stringify( text.split("\n") );
        console.log( "Query JSON: " + text_json );

        text_json = encodeURIComponent( text_json );
    }

    var journals_json = "";
    if( "journals" in params )
    {
        var journals = params["journals"];
        var journals_json = JSON.stringify( journals );
        console.log( "Jounrals JSON: " + journals_json );

        journals_json = encodeURIComponent( journals_json );
    }

    if( "onDone" in params ) onDone = params["onDone"];
    else                     onDone = function(data) {;};


    if( "onError" in params ) onError = params["onError"];
    else                      onError = function() {console.error( "Error on query."  );};

    //year_start  = "year_start"  in params ? params['year_start'] : arclight_year_min;
    //year_end    = "year_end"    in params ? params['year_end']   : arclight_year_max;


    var url  = "/query?text=" + text_json;
        //url += "&year_start=" + year_start;
        //url += "&year_end="   + year_end;
        if( journals_json != "" ) 
            url += "&journals=" + journals_json;

    //url = encodeURIComponent( url );

    console.log( "Query URL: " + url );

    //TODO: handle error
    $.ajax({ url : url })
                .done(function( data ) {
                    return onDone( data );
          })
        .fail(function( ) {
              onError();
          });
}


function parse_data( data_xml, query, filter_journals )
{
    var xmlDoc = $.parseXML( data_xml );
    var xml = $( xmlDoc );
    //var test = xml.find( "[name=\"QTime\"]" );


    //TODO: extract query
    //var query = xml.find( '[name="responseHeader"] [name="params"] [name="q"]' ).text();
    //    query = query.replace( "{!dismax qf=body}", "" );
    //    if(query)
    // q={!dismax%20qf=body}
    //console.log( "Query text: " + query );

    var data = [];

    var values_xml = xml.find( '[name="facet_ranges"] [name="year"] [name="counts"]' );

    values_xml.children().each( function( i ) {
      
        var year    = parseInt($(this).attr("name"));
        var count   = parseInt($(this).text());
        
        //TODO: extract query during parse
        var url     = make_lantern_url( {   "query"      : query,
                                            "year_begin" : year,
                                            "year_end"   : year,
                                            "filter:journals"   : filter_journals
                                      } );

        if(count == 0)  count = null;

        data.push( { "x": year, "y": count, "url": url } );

        //$(document.body).append( "<p>"+ name +" : "+ count +"</p>" );

    });

    var journals = [];
    var journals_flat = {};
    var journals_xml = xml.find( '[name="facet_fields"] [name="title"]' );
    journals_xml.children().each( function( i ) {
      
        //console.log( $(this).attr("name") );

        var title   = $(this).attr("name");
        var count   = parseInt($(this).text());


        //console.log( "journal: " + title +" : "+ count );

        journals.push( { "title": title, "count": count } );
        journals_flat[ title ] = count;
    });
    journals.sort( function(a,b) { return -(a.count - b.count);  } );

    //$("body").append( JSON.stringify( journals_flat ) );

    return { "data": data, "query_text": query, "journals": journals };
}


function parse_pie( data_xml )
{
    var xmlDoc = $.parseXML( data_xml );
    var xml = $( xmlDoc );
    var test = xml.find( "[name=\"QTime\"]" );
    //var values_xml = xml.find( '[name="result"] [name="facet_ranges"] [name="year"] [name="counts"]' );

    var data = [];

    var values_xml = xml.find( '[name="facet_counts"] [name="facet_fields"] [name="title"]' );

    //$(document.body).append( "<p>Test output: </p>" )

    //$(document.body).append( values_xml );

    values_xml.children().each( function( i ) {
      
        var name    = parseInt($(this).attr("name"));
        var count   = parseInt($(this).text());

        if(count == 0)  count = null;

        data.push( [ name, count ] );

        //$(document.body).append( "<p>"+ name +" : "+ count +"</p>" );

    });

    return data;
}