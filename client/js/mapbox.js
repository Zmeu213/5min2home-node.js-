 function showAlert() {
        alert("It works")
    }
    
function example_api() 
        {
          var flickerAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
          $.getJSON( flickerAPI, {
            tags: "mount rainier",
            tagmode: "any",
            format: "json"
          })
            .done(function( data ) {
              $.each( data.items, function( i, item ) {
                $( "<img>" ).attr( "src", item.media.m ).appendTo( "#images" );
                if ( i === 3 ) {
                  return false;
                }
              });
            });
            alert("works")
        }
        
function getGeo(lat, lng, id, api){
  var addres = "";
  var key = "AIzaSyBnAyT4dX07qOyh-dyPg9WYYXqHHvjSWtk";
  if (!api) {api = "https://maps.googleapis.com/maps/api/geocode/json?"}
  var full_id= "#" + id;
  var field = $( full_id)
  $.getJSON(api, {
    latlng: lat + ',' + lng,
    key: key
 })
 .done(function( data ) {
   $.each( data.results, function( i, result ){
     field.empty().val(result.formatted_address);
     if ( i == 0 ) {
       console.log(field)
       return false; 
       
     }
   })
 })
}