function processTextarea() {
  const textarea = document.getElementById('textData'); // replace with your textarea id
  const lines = textarea.value.split('\n');

  let jsonArray = [];
  let textData = "";
  for (const line of lines) {
    if ((line.startsWith('Hours of Operation Profile #') || line.startsWith('Hours of Operation') || line.startsWith('Hours of')) && textData !== "") {
      let jsonObject = convertToJSON(textData);
      jsonArray.push(jsonObject);

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
		"holidays": [],
		"overrideBranch": "",
		"overrideExpirationDate": "",
		"skills": []
	};

	let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let currentDay = null;

	lines.forEach(line => {
		if (line.startsWith('Profile Name:')) {
			jsonData.profileName = line.split(':')[1].trim();
		} else if (days.includes(line.split('\t')[0])) {
			currentDay = line.split('\t')[0];
			jsonData.days.push({
				"day": currentDay,
				"openTime": line.split('\t')[1],
				"closeTime": line.split('\t')[2],
				"hasAdditionalHours": false,
				"additionalOpenTime": "",
				"additionalCloseTime": "",
				"isClosedAllDay": false
			});
		}
	});

	return jsonData;
}
