<?php
  $json_string = file_get_contents("http://api.wunderground.com/api/e1f92b15fcb8aa24/geolookup/conditions/q/CT/Groton.json");
  $parsed_json = json_decode($json_string);
  $location = $parsed_json->{'location'}->{'city'};
  $temp_f = $parsed_json->{'current_observation'}->{'temp_f'};
  $windchill_f = $parsed_json->{'current_observation'}->{'windchill_f'};
  $weather = $parsed_json->{'current_observation'}->{'weather'};
  if($location == ''){
      echo 'Current Conditions Not Available From API';
  }else{
  echo "Current temperature in ${location} is: ${temp_f}<br />\n";
  echo "the wind chill is ${windchill_f} and conditions are ${weather}\n ";
}
