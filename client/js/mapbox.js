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
    key: key,
    language: "ru"
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

function IDGenerator() {
  this.length = 15;
  this.timestamp = +new Date;
     
  var _getRandomInt = function( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
  }
     
  this.generate = function() {
    var ts = this.timestamp.toString();
    var parts = ts.split( "" ).reverse();
    var id = "";
       
    for( var i = 0; i < this.length; ++i ) {
      var index = _getRandomInt( 0, parts.length - 1 );
      id += parts[index];  
    }
    return id;
  }
};

function returnData(data){
    return data;
}

function api_select( callback ) {
  var result;
  var api = "https://node-hackerman.c9users.io:8081/api/select";
  $.getJSON(api)
  .done(function( data ) {
    console.log(JSON.stringify(data));
    result = data;
    console.log("RESULT: " + result[0])
    callback(returnData(result));
  })
  
};

function api_insert(src_lng, src_lat, dst_lng, dst_lat) {
  var generator = new IDGenerator;
  var api = "https://node-hackerman.c9users.io:8081/api/insert/" + 
            src_lng + "/" + src_lat + "/" + 
            dst_lng + "/" + dst_lat + "/" + 
            generator.generate() ;
  $.getJSON(api)
  .done(function( data ) {
    console.log(data)
  })
};

function api_search_in_radius(lng, lat, rad) {
  var api = "https://node-hackerman.c9users.io:8081/api/select/" + 
            lng + "/" + lat + "/" + rad;
  $.getJSON(api)
  .done(function( data ) {
    console.log(data)
  });
};

function maps_view(DG, map, callback) {
  var stack = [];
  api_select(function (q) {
    console.log(map)
    for (var i = 0; i < q.length; i++) {
      console.log(JSON.stringify(q[i].src.x) + " " + JSON.stringify(q[i].src.y))
      stack.push([q[i].src.x, q[i].src.y]);
    }
    console.log(stack)
    callback(returnData(stack))
  })
  //console.log("MY MAT: " + mat.select());
};