function processTextarea() {
  const textarea = document.getElementById('textData'); // replace with your textarea id
  const lines = textarea.value.split('\n');

  let jsonArray = [];
  let textData = "";
  for (const line of lines) {
    if ((line.startsWith('Hours of Operation Profile #') || line.startsWith('Hours of Operation') || line.startsWith('Hours of')) && textData !== "") {
      let jsonObject = convertToJSON(textData);
	let jsonHourOfOperation = { "hourOfOperation": jsonObject };
      jsonArray.push(jsonHourOfOperation);

      textData = "";
    }

    textData += line + '\n';
  }

  if (textData !== "") {
    let jsonObject = convertToJSON(textData);

    if (isDefined(jsonObject.profileName) && jsonObject.profileName !== "") {
      jsonArray.push(jsonObject);
    }
  }

  // Now jsonArray contains the array of JSON objects
  console.log(jsonArray);
  return jsonArray;
}

function convertToJSON(textData) {
	let lines = textData.split('\n');
	let jsonData = {
		"profileName": "",
		"description": "",
		"notes": "",
		"days": [],
		// "holidays": [],
		"overrideBranch": "None",
		"overrideExpirationDate": ""
		// "skills": []
	};

	let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let currentDay = null;

	lines.forEach(line => {
		if (line.startsWith('Profile Name:')) {
			jsonData.profileName = line.split(':')[1].trim();
		} else if (days.includes(line.split('\t')[0])) {
			currentDay = line.split('\t')[0];
			let isClosedAllDay = false;
			let openTime = line.split('\t')[1];
			let closeTime = line.split('\t')[2];

			let trimOpenTime = openTime.trim().toLowerCase();
			
			if (openTime.toLowerCase() === "closed" || closeTime.toLowerCase() === "closed") {
				isClosedAllDay = true;
				openTime = "";
				closeTime = "";
			} else if (
				trimOpenTime === "24 hrs" || 
				trimOpenTime === "24hrs" || 
				trimOpenTime === "24 hours" || 
				trimOpenTime === "24hours" || 
				trimOpenTime === "24h" || 
				trimOpenTime === "24 h" || 
				closeTime.toLowerCase() === "n/a"
			) {
				openTime = "00:00:00";
				closeTime = "23:59:59";
			} else {
				openTime = convertToFormattedTime(openTime);
				closeTime = convertToFormattedTime(closeTime);
			}
			
			jsonData.days.push({
				"day": currentDay,
				"openTime": openTime,
				"closeTime": closeTime,
				"hasAdditionalHours": false,
				"additionalOpenTime": "",
				"additionalCloseTime": "",
				"isClosedAllDay": isClosedAllDay
			});
		}
	});

	return jsonData;
}

function convertToFormattedTime(time) {
    var [hours, minutes] = time.split(':');

    // Add leading zeros if needed
    hours = hours.padStart(2, '0');
    minutes = minutes.padStart(2, '0');

    // Create the formatted time string
    var formattedTime = hours + ':' + minutes + ':00';

    return formattedTime;
}

function convertTo12HourFormat(time24) {
    // Extract hours and minutes
    var [hours, minutes] = time24.split(':');

    // Convert to 12-hour format
    var period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Handle midnight (0) and noon (12)

    // Format the result
    var time12 = hours + ':' + minutes + ' ' + period;

    return time12;
}
