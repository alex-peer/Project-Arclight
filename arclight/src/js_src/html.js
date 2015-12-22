/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */


function html_encode( val )
{
  return String( val )
    .replace( /&/g, '&amp;'  )
    .replace( /</g, '&lt;'   )
    .replace( />/g, '&gt;'   )
    .replace( /"/g, '&quot;' )
    .replace( /'/g, '&#39;'  );
}


function svg( file_no_extension )
{
    return '<img src="'+ file_no_extension +'.svg" onerror="this.onerror=null; this.src=\"' + file_no_extension + '.png\"" />';
}

function array_to_string( array, divider )
{
    if( divider === undefined )
        divider = " ";

    s = "";
    if( $.isArray( array ) )
    {
        for( i in array )
        {
            s += array[i];
            s += divider;
        }
    }    
    else
    {
        s += array;
    }

    return s;
}

function div( attribs, contents )
{
    p = attribs;

    html = "<div ";
    
    if(p['id']) html += "id='" + html_encode( p['id'] ) +"' ";
    
    if(p['class'])
    { 
        html += "class='";

        html += html_encode( array_to_string( p['class'] ) );

        html += "' ";
    }


    if(p['style'])
    { 
        html += "style='";
        html += array_to_string( p['style'] );
        html += "' ";        
    }   

    html += ">";

    if( contents )
    {
        html += array_to_string( contents );
    }

    html += "</div>";

    return html;
}
