
var instances = {};
var excludeThose = {};

window.onload = function()
{
  console.log("Slurifax Creations");
  
  // localStorage.clear();
  
  if(localStorage.getItem('instances') != null)
  {
    instances = JSON.parse(localStorage.getItem('instances'));
    excludeThose = JSON.parse(localStorage.getItem('excludeThose'));
    
    console.log(JSON.parse(localStorage.getItem('excludeThose')));
    console.log(instances);
    
    var keys = Object.keys(instances);
    for(var i=0;i<keys.length;i++)
    {
      var key = keys[i];
      var inst = instances[key];
      
      DoIt(key, inst.filter, inst.imgCount, inst.pageNr, false, false);
    }
  }
  else
  {
    DoIt("ImagesGoesHere", ["rain", "swamp"], 6, 1, true, false);
    DoIt("AnotherOne", ["sun", "tree", "climb"], 12, 1, true, false);
    
    localStorage.setItem('instances', JSON.stringify(instances));
    localStorage.setItem('excludeThose', JSON.stringify(excludeThose));
  }
};

function DoIt(targetId, filter, imgCount, pageNr, doAdd, onlyLast)
{
  if(doAdd)
  {
    instances[targetId] = {filter:filter, imgCount:imgCount, pageNr:pageNr};
    excludeThose[targetId] = [];
  }
    
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) 
    {
      // console.log(this.responseText);
      var txt = this.responseText;
      
      var json;
      try 
      {
        json = JSON.parse(txt);
        console.log(json);
      } 
      catch (e) 
      {
        console.log('This doesn\'t look like a valid JSON: ', txt);
        return;
      }
      
      var imgDiv = document.getElementById(targetId);

      if(onlyLast == true)
      {
        // Add last only.
        var photo = json.photos.photo[json.photos.photo.length - 1];
        
        var url = CreatePhoto(photo);
        // console.log(url);
        
        imgDiv.innerHTML += '<img class="one-of-those-images" id="image' + photo.id + '" src="'+ url + '" onclick="RemoveImage(\'' + targetId + '\',' + photo.id + ');">';
      }
      else
      {
        for(var i=0; i<json.photos.photo.length; i++)
        {
          var photo = json.photos.photo[i];
          
          if(excludeThose[targetId].indexOf(photo.id + "") == -1)
          {
            var url = CreatePhoto(photo);
            // console.log(url);
            
            imgDiv.innerHTML += '<img class="one-of-those-images" id="image' + photo.id + '" src="'+ url + '" onclick="RemoveImage(\'' + targetId + '\',' + photo.id + ');">';
          }
        }
      }
    }
  };
  
  var url = "https://api.flickr.com/services/rest/?";
  var method = "method=flickr.photos.search&";
  var api_key = "api_key=b36822a18ddea0e3bd497a333e3b696d&";

  var tags = "";
  if(filter.length > 0)
  {
    tags = "tags=";
    for(var i=0; i<filter.length; i++)
    {
      var tag = filter[i];
      tags += tag + "%2C";
    }
    tags += "&";
  }
  
  var page = "page=" + pageNr + "&";
  var tag_mode = "tag_mode=all&";
  var per_page = "per_page=" + imgCount + "&";
  var format = "format=json&";
  var nojsoncallback = "nojsoncallback=1";
  
  var fullUrl = url + method + api_key + tags + tag_mode + page + per_page + format + nojsoncallback;
  console.log(fullUrl);
  
  xhttp.open(
    "GET",
    fullUrl, 
    true
  );

  xhttp.send();
}

function CreatePhoto(photo)
{
  var url = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg";
  return url;
}

function RemoveImage(targetId, id)
{
  var img = document.getElementById("image" + id);

  excludeThose[targetId].push(id + "");
  
  img.parentElement.removeChild(img);
  
  var inst = instances[targetId];
  
  // Ugliest ever, since we have removed one picture, increase the number of images to fetch by one, and exclude those excluded..
  inst.imgCount++;
  DoIt(targetId, inst.filter, inst.imgCount, inst.pageNr, false, true);
  
  localStorage.setItem('instances', JSON.stringify(instances));
  localStorage.setItem('excludeThose', JSON.stringify(excludeThose));
  
  // console.log(targetId);
  // console.log(excludeThose);
  // console.log(instances);
}

  
