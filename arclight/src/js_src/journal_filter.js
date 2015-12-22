/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */

function init_journal_search()
{
    // on hide modal, refresh searches
    $('#journal_filter_area').on('hidden.bs.modal', function () {
        stop_journal_search();
    })


    $("body").on('keyup', "#journal_entry_box input", function() {
    //$('#journal_entry_box input').keyup( //.on(  'keyup click input',// focus', 
                                        main_journal_filter_search(); 
                                    }    );

    $("#journal_filter_area").on(
        "click",
        ".filter_journal .btn_remove",
        function() {

            var title = $(this).parent().text().trim();
            console.log( "\tRemoving: " + title );
            remove_from_filter( journals_main_filter, title );
            $(this).parent().remove();

            //update_chart();
        }
    );   

    $("#journal_filter_area #journals_search_results").on(
        "click",
        ".found_journal",
    //$(selector + " .found_journal").click( 
        function()
        {

            var title = $(this).text();
            console.log( "\tAdd: " + title );
            // handle duplicate entries
            if( ! is_journal_in_filter( journals_main_filter, title ) )
            {
                journals_main_filter.push( title );
                show_journal_filter( "#journal_filter_area #selected_journals", journals_main_filter );
            }

        }
    );

    $("")
}

function stop_journal_search()
{
    update_all_with_new_filter();
}

function start_main_journal_search()
{
    // end if click outside of element
    /*
    onClickOff( "#journal_filter_area", 
                function() {
                    if( $('#journal_filter_area').is( ":visible") ) 
                    {
                        //$(journal_filter_search_input).val("");
                        clear_journal_search_results();
                        $('#journal_filter_area').hide();
                    }
                });
    */


    $('#journal_filter_area').modal();
}


function main_journal_filter_search()
{

    console.log( "JOURNAL FILTER SEARCH ACTION!" );
    var selector_results = "#journal_filter_area #journals_search_results";

    var search_term = $('#journal_entry_box input').val();
    if(search_term.length == 0)
    {
        clear_journal_search_results( selector_results );
        return;
    }
    var results = search_journals(  all_journals, 
                                    search_term             );

    //clear_journal_search_results(   selector_results        );    
    show_journals_search_results(   selector_results, 
                                    journals_main_filter, 
                                    results                 );
        
}









function search_journals( journals, search_term )
{
    var results = [];

    var term_lower = search_term.toLowerCase();

    for( i in journals )
    {
        journal_toLower = journals[i]['title'].toLowerCase();
        if( journal_toLower.indexOf( term_lower ) != -1 )
        {   
            results.push( journals[i] );
            //console.log( "journal match: " + journals[i]['title']);
        }
        else
        {
            //console.log( "NO MATCH: " + journals[i]['title'] + " vs " + search_term );
        }
    }

    console.log( "Search Term: " + term_lower );
    console.log( "\ttotals journals matched: " + results.length );

    return results;
}

function clear_journal_search_results( selector )
{
    dest_div = $(selector);
    dest_div.html("&nbsp;");
}

function is_journal_in_filter( filter, title )
{
    for( i in filter )
    {
        if( filter[i].indexOf( title ) != -1 )
            return true;
    }
    return false;
}

function remove_from_filter( filter, title )
{
    for( i in filter )
    {
        if( filter[i] == title )
        {
            filter.splice(i,1);
            console.log("\tfound and removed from filter: " + title);
            return true;
        }    
    }
    return false;
}

function show_journal_filter( selector, filter )
{
    dest_div = $(selector);
    dest_div.html("");
    var title;

    for( i in filter )
    {

        //console.log( "showing: " + journals[i]['title']);

        title = filter[i];
        dest_div.append( div(   {"class":"filter_journal" }, 
                                [   
                                    div( {"class":"btn_remove button small"}, 
                                        svg( "img/icon_remove_series" ) ),
                                    div({'class':'title'}, title ),
                                    div({"class":"clear"})
                                ]
                        ) );


    } 


    //$("#journal_filter_area .filter_journal .btn_remove").each(
    //    function() {
    //        $(this).css( "padding", $(this).parent().height()/2 );
    //    });

}

function show_journals_search_results( selector, filter, results )
{
    dest_div = $(selector);
    dest_div.html("");
    var title;

    for( i in results )
    {

        //console.log( "showing: " + journals[i]['title']);

        title = results[i]['title'];
        dest_div.append( div( {"class":"found_journal" }, title ) );

        //Trim title?
        //$(selector + " .found_journal").dotdotdot({
        ////  configuration goes here
        //});
    }
}
