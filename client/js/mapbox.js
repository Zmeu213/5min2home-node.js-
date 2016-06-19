//var GLOBAL_API = "46.101.113.240:8081"
var GLOBAL_API = "localhost:8081"

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
  var api = "http://" + GLOBAL_API + "/api/select";
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
  var api = "http://" + GLOBAL_API + "/api/insert/" + 
            src_lng + "/" + src_lat + "/" + 
            dst_lng + "/" + dst_lat + "/" + 
            generator.generate() ;
  $.getJSON(api)
  .done(function( data ) {
    console.log(data)
  })
};

function api_search_in_radius(lng, lat, rad, callback) {
  var api = "http://" + GLOBAL_API + "/api/select/id/" + 
            lng + "/" + lat + "/" + rad;
  $.getJSON(api)
  .done(function( data ) {
    console.log(data)
    callback(returnData(data));
  });

};

function api_get_src_from_id(id, callback) {
    var api = "http://" + GLOBAL_API + "/api/select/src_from_id/" + id;
    $.getJSON(api)
    .done(function( data ) {
        console.log(data)
        callback(returnData(data));
  });
}

function view_markers(type, callback) {
  var stack = [];
  api_select(function (q) {
    for (var i = 0; i < q.length; i++) {
    	if (type == "src"){
          	console.log(JSON.stringify(q[i].src.x) + " " + JSON.stringify(q[i].src.y))
          	stack.push([q[i].src.x, q[i].src.y]);
    	}
    	if (type == "dst"){
    		console.log(JSON.stringify(q[i].dst.x) + " " + JSON.stringify(q[i].dst.y))
            stack.push([q[i].dst.x, q[i].dst.y]);
    	}
    }
    console.log(stack)
    callback(returnData(stack))
  })
  //console.log("MY MAT: " + mat.select());
};

function search_this(src_lng, src_lat, dst_lng, dst_lat, callback) {
    var rad = 0.01;
    var stack_src = [], stack_dst = [];
    api_search_in_radius(src_lng, src_lat, rad, function(q) {
        for (var i = 0; i < q.length; i++) {
            console.log(q[i].user_id);
            api_get_src_from_id(q[i].user_id, function(f) {
                console.log(JSON.stringify(f[0].src))
                stack_src.push(f[0].src)
                 console.log(stack_src)
    callback(returnData(stack_src))
            })
        }

    })

};